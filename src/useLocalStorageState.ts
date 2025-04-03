import { useEffect, useState } from "react";

export function useLocalStorageState<TType>(key: string, defaultValue: TType) {
    const storedValue = localStorage.getItem(key);
    const resolvedDefaultValue = storedValue !== null ? JSON.parse(storedValue) as TType : defaultValue;
    const [state, setState] = useState(resolvedDefaultValue);

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [state]);

    return [state, setState] as const;
}
