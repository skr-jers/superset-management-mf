import SupersetAdminPanel from './components/panes/superset-admin-pane'
import Keycloak from 'keycloak-js';
let initOptions = {
  url: 'http://localhost:8080/',
  realm: 'Kerno 360',
  clientId: 'kerno360-admin'
}
export const keycloak = new Keycloak(initOptions);




try {
  const authenticated = await keycloak.init({
      onLoad: 'login-required',
      redirectUri: window.location.origin + '/'
  });
  if (authenticated) {
      sessionStorage.setItem('kc-token', keycloak.token? keycloak.token: '');
      // Load user profile
      await keycloak.loadUserProfile();

      // Log user details
  } else {
      window.location.reload();
  }

} catch (error) {
  console.error("Authenticated Failed");
}
function App() {

  return (
    <>
      <SupersetAdminPanel />
    </>
  )
}

export default App
