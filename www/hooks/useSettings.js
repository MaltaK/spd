import { useState, useEffect } from 'react';
import userSettingsService from '../modules/user_settings/service';

export function useSettings() {

    let [ settings, setSettings ] = useState(userSettingsService.getSettings());

    useEffect(() => {
        let handler = settings => setSettings(settings);
        userSettingsService.addListener(handler);
        return () => userSettingsService.removeListener(handler);
    }, []);

    return settings;

}
