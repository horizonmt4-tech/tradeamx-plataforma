import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const LocalizationContext = createContext(null);

export const useLocalization = () => {
    const context = useContext(LocalizationContext);
    if (context === undefined) {
        throw new Error('useLocalization must be used within a LocalizationProvider');
    }
    return context;
};

export const countrySettings = {
    MX: { currency: 'MXN', symbol: 'MX$', name: 'México', rate: 19.00 },
    CO: { currency: 'COP', symbol: 'COP$', name: 'Colombia', rate: 4200.00 },
    PE: { currency: 'PEN', symbol: 'S/', name: 'Perú', rate: 3.80 },
    CL: { currency: 'CLP', symbol: 'CLP$', name: 'Chile', rate: 950.00 },
    EC: { currency: 'USD', symbol: '$', name: 'Ecuador', rate: 1.00 },
    default: { currency: 'USD', symbol: 'USD$', name: 'Otro (USD)', rate: 1.00 },
};

export const LocalizationProvider = ({ children }) => {
    const [localization, setLocalization] = useState({
        country: 'default',
        currency: 'USD',
        symbol: 'USD$',
        rate: 1,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRemoteRates = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase.functions.invoke('get-localization-data');
                if (data && data.rates) {
                    // This part is for future-proofing if we want to override defaults with live rates
                    // For now, the default rates are dominant
                }
            } catch (error) {
                console.error("Error fetching remote rates, using default rates:", error);
            } finally {
                setLoading(false);
            }
        };
        // We can call fetchRemoteRates() here if we want to get live rates in the background
    }, []);
    
    const setCountry = useCallback((countryCode) => {
        const settings = countrySettings[countryCode] || countrySettings.default;
        
        setLocalization({
            country: countryCode,
            currency: settings.currency,
            symbol: settings.symbol,
            rate: settings.rate,
        });
    }, []);

    const formatPrice = (usdPrice) => {
        if (typeof usdPrice !== 'number' || isNaN(usdPrice)) {
             return `${localization.symbol} 0.00`;
        }

        const localPrice = usdPrice * localization.rate;
        
        const options = (['COP', 'CLP'].includes(localization.currency))
            ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
            : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
        
        const formattedPrice = localPrice.toLocaleString('en-US', options);

        return `${localization.symbol} ${formattedPrice}`;
    };

    const value = {
        ...localization,
        loading,
        setCountry,
        formatPrice,
        countries: countrySettings,
    };

    return (
        <LocalizationContext.Provider value={value}>
            {children}
        </LocalizationContext.Provider>
    );
};