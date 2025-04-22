import { useRef, useState, useEffect } from 'react';

const MainSEc = () => {
    const [username, setUsername] = useState('');
    const [gender, setGender] = useState('');
    const [interests, setInterests] = useState<string[]>([]);
    const [currentInterest, setCurrentInterest] = useState('');
    const [countries, setCountries] = useState<string[]>([]);
    const [currentCountry, setCurrentCountry] = useState('');
    const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);
    const [preferredGender, setPreferredGender] = useState('');
    const [allCountries, setAllCountries] = useState<string[]>([]);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const interestInputRef = useRef<HTMLInputElement>(null);
    const countryInputRef = useRef<HTMLInputElement>(null);

    const interestSuggestions = ['Football', 'Music', 'Reading', 'Gaming', 'Travel', 'Cooking', 'Photography', 'Art', 'Technology', 'Sports'];
    const popularCountries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia', 'Brazil', 'India', 'China'];

    useEffect(() => {
        // Load countries list
        const loadCountries = async () => {
            try {
                const response = await fetch('https://restcountries.com/v3.1/all');
                const data = await response.json();
                const countryNames = data.map((country: any) => country.name.common);
                setAllCountries(countryNames.sort());
            } catch (error) {
                console.error('Failed to load countries:', error);
                setAllCountries(popularCountries);
            }
        };

        loadCountries();

        // Get user camera
        const getCamera = async () => {
            try {
                // First check if we have permission
                const permissions = await navigator.permissions.query({ name: 'camera' as any });
                
                if (permissions.state === 'denied') {
                    setCameraError('Camera access was denied. Please check your browser settings or another application might be using the camera.');
                    return;
                }

                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    } 
                });
                
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setCameraError(null);
                }
            } catch (err) {
                console.error('Error accessing camera:', err);
                handleCameraError(err);
            }
        };

        const handleCameraError = (error: any) => {
            let errorMessage = 'Camera is not working.';
            
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Camera access was denied. Please check your browser permissions.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'No camera device found.';
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'Camera is already in use by another application.';
            } else if (error.name === 'OverconstrainedError') {
                errorMessage = 'Camera does not support the requested settings.';
            } else if (error.name === 'SecurityError') {
                errorMessage = 'Camera access is disabled for security reasons.';
            }
            
            setCameraError(errorMessage);
            
            // Show placeholder if camera fails
            if (videoRef.current) {
                videoRef.current.style.background = '#e5e7eb';
                videoRef.current.style.display = 'flex';
                videoRef.current.style.alignItems = 'center';
                videoRef.current.style.justifyContent = 'center';
                videoRef.current.style.color = '#6b7280';
                videoRef.current.innerHTML = '<span>Camera Unavailable</span>';
            }
        };

        getCamera();

        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleNewUser = (e: React.FormEvent) => {
        e.preventDefault();
        const userData = {
            username,
            gender,
            interests,
            countries,
            preferredGender
        };
        console.log('New user data:', userData);
        // Here you would typically send this data to your backend
    };

    const addInterest = (e: React.KeyboardEvent | React.MouseEvent, interest?: string) => {
        if ((e as React.KeyboardEvent).key === 'Enter' || interest) {
            e.preventDefault();
            const newInterest = interest || currentInterest.trim();
            if (newInterest && !interests.includes(newInterest)) {
                setInterests([...interests, newInterest]);
                setCurrentInterest('');
            }
            if (interestInputRef.current) {
                interestInputRef.current.focus();
            }
        }
    };

    const removeInterest = (interestToRemove: string) => {
        setInterests(interests.filter(interest => interest !== interestToRemove));
    };

    const addCountry = (e: React.KeyboardEvent | React.MouseEvent, country?: string) => {
        if ((e as React.KeyboardEvent).key === 'Enter' || country) {
            e.preventDefault();
            const newCountry = country || currentCountry.trim();
            if (newCountry && !countries.includes(newCountry)) {
                // Try to find the official country name if the user typed an alias
                const officialCountry = getOfficialCountryName(newCountry);
                if (officialCountry && !countries.includes(officialCountry)) {
                    setCountries([...countries, officialCountry]);
                } else if (!officialCountry) {
                    setCountries([...countries, newCountry]);
                }
                setCurrentCountry('');
                setCountrySuggestions([]);
            }
            if (countryInputRef.current) {
                countryInputRef.current.focus();
            }
        }
    };

    const removeCountry = (countryToRemove: string) => {
        setCountries(countries.filter(country => country !== countryToRemove));
    };

    const handleCountryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCurrentCountry(value);
        
        if (value.length > 1) {
            const filtered = allCountries.filter(c => 
                c.toLowerCase().includes(value.toLowerCase()) ||
                getCountryAliases(c).some(alias => alias.includes(value.toLowerCase()))
            ).slice(0, 5);
            setCountrySuggestions(filtered);
        } else {
            setCountrySuggestions([]);
        }
    };

    // Helper function for country aliases
    const getCountryAliases = (country: string) => {
        const aliases: Record<string, string[]> = {
            'United States': ['usa', 'us', 'america', 'united states of america'],
            'United Kingdom': ['uk', 'gb', 'britain', 'great britain', 'england'],
            'Germany': ['deutschland', 'germany'],
            'South Korea': ['korea', 's. korea'],
            'Czech Republic': ['czechia'],
            'Russian Federation': ['russia'],
            'Iran, Islamic Republic of': ['iran'],
            // Add more as needed
        };
        return aliases[country] || [];
    };

    // Try to match user input to official country name
    const getOfficialCountryName = (input: string) => {
        const lowerInput = input.toLowerCase();
        // First check exact matches
        const exactMatch = allCountries.find(c => c.toLowerCase() === lowerInput);
        if (exactMatch) return exactMatch;
        
        // Then check aliases
        for (const country of allCountries) {
            if (getCountryAliases(country).some(alias => alias === lowerInput)) {
                return country;
            }
        }
        
        // Then check partial matches
        const partialMatch = allCountries.find(c => 
            c.toLowerCase().includes(lowerInput) || 
            lowerInput.includes(c.toLowerCase())
        );
        
        return partialMatch || null;
    };

    return (
        <div className="w-full h-full p-4 dark:bg-gray-900 bg-white flex flex-col md:flex-row items-center justify-center gap-8">
            {/* Video Section */}
            <div className=" md:w-1/2 flex justify-center flex-col">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="rounded-lg max-w-full h-auto max-h-96 border-2 border-gray-300 dark:border-gray-600"
                />
                {cameraError && (
                    <div className="mt-2 p-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded">
                        {cameraError}
                    </div>
                )}
                {cameraError && (
                    <button
                        onClick={async () => {
                            try {
                                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                                if (videoRef.current) {
                                    videoRef.current.srcObject = stream;
                                    setCameraError(null);
                                }
                            } catch (err) {
                                console.error('Error retrying camera:', err);
                            }
                        }}
                        className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Try again
                    </button>
                )}
            </div>
            {/* Form Section */}
            <form onSubmit={handleNewUser} className="w-full md:w-1/2 flex flex-col gap-4 max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Continue as Guest</h2>
                
                {/* Username */}
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                        required
                    />
                </div>
                
                {/* Gender */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Your Gender
                    </label>
                    <div className="mt-1 flex gap-4">
                        {['Male', 'Female', 'Other'].map((opt) => (
                            <label key={opt} className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    checked={gender === opt}
                                    onChange={() => setGender(opt)}
                                    className="text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:bg-gray-700"
                                />
                                <span className="ml-2 text-gray-700 dark:text-gray-300">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
                
                {/* Interests */}
                <div>
                    <label htmlFor="interests" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Interests (Add as tags)
                    </label>
                    <div className="mt-1 flex flex-wrap gap-2 items-center">
                        {interests.map((interest) => (
                            <span 
                                key={interest} 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                            >
                                {interest}
                                <button
                                    type="button"
                                    onClick={() => removeInterest(interest)}
                                    className="ml-1.5 inline-flex text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        <input
                            ref={interestInputRef}
                            type="text"
                            id="interests"
                            value={currentInterest}
                            onChange={(e) => setCurrentInterest(e.target.value)}
                            onKeyDown={(e) => addInterest(e)}
                            className="flex-1 min-w-[100px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                            placeholder="Type and press Enter"
                        />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {interestSuggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={(e) => addInterest(e, suggestion)}
                                className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Countries */}
                <div className="relative">
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Countries (Add as tags)
                    </label>
                    <div className="mt-1 flex flex-wrap gap-2 items-center">
                        {countries.map((country) => (
                            <span 
                                key={country} 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            >
                                {country}
                                <button
                                    type="button"
                                    onClick={() => removeCountry(country)}
                                    className="ml-1.5 inline-flex text-green-400 hover:text-green-600 dark:hover:text-green-300"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        <input
                            ref={countryInputRef}
                            type="text"
                            id="country"
                            value={currentCountry}
                            onChange={handleCountryInputChange}
                            onKeyDown={(e) => addCountry(e)}
                            className="flex-1 min-w-[100px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                            placeholder="Type and press Enter"
                        />
                    </div>
                    {countrySuggestions.length > 0 && (
                        <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md py-1 max-h-60 overflow-auto border border-gray-200 dark:border-gray-600">
                            {countrySuggestions.map((countryName) => (
                                <li
                                    key={countryName}
                                    onClick={(e) => {
                                        addCountry(e, countryName);
                                        setCountrySuggestions([]);
                                    }}
                                    className="px-3 py-2 hover:bg-indigo-100 dark:hover:bg-indigo-900 cursor-pointer"
                                >
                                    {countryName}
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                        {popularCountries.map((country) => (
                            <button
                                key={country}
                                type="button"
                                onClick={(e) => addCountry(e, country)}
                                className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                            >
                                {country}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Preferred Chat Gender */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Preferred Gender to Chat With
                    </label>
                    <div className="mt-1 flex gap-4">
                        {['Male', 'Female', 'Any'].map((opt) => (
                            <label key={opt} className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="preferredGender"
                                    checked={preferredGender === opt}
                                    onChange={() => setPreferredGender(opt)}
                                    className="text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:bg-gray-700"
                                />
                                <span className="ml-2 text-gray-700 dark:text-gray-300">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
                
                {/* Submit Button */}
                <button
                    type="submit"
                    className="mt-4 inline-flex
                     justify-center
                      py-2 px-4  
                      border-transparent 
                      shadow-sm text-sm font-medium rounded-md
                       text-white
                        bg-yellow-400 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 dark:bg-yellow-400 dark:hover:bg-yellow-400"
                >
                    Continue as Guest
                </button>
            </form>
        </div>
    );
};

export default MainSEc;