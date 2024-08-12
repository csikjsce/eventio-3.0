import logo from '../../assets/logo.png';
import somaiyaLogo from '../../assets/somaiya-logo1.png';
import trustLogo from '../../assets/somaiya-trust.png';
import './SplashScreen.css'; // Ensure to import your CSS file

function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-evenly min-h-screen text-center space-y-2"> {/* Added space-y-6 for vertical spacing */}
      <div>
        <img src={logo} alt="Logo" className="logo" />
        <div>
        <h1 className="text-4xl font-bold font-marcellus text-vitality-red">Eventio</h1>
        <p className="text-gray-600 text-xl italic font-fira">By CSI-KJSCE</p>

      </div>
      </div>
      
      <div className="flex justify-center items-center mb-4"> {/* Added mb-4 for spacing below loader */}
        <div className="loader"></div>
      </div>
      <div className="flex items-center gap-4">
        <img src={somaiyaLogo} alt="Somaiya Logo" className="h-12 w-auto" />
        <img src={trustLogo} alt="Trust Logo" className="h-12 w-auto" />
      </div>
    </div>
  );
}

export default SplashScreen;
