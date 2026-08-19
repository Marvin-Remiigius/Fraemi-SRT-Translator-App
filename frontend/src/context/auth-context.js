import { createContext, useContext } from 'react';

// The context object and its hook live in a non-component module so that
// AuthContext.jsx can export only the provider — react-refresh disables fast
// refresh for any file that mixes component and non-component exports.
export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
