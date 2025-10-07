import { useNavigate } from 'react-router-dom';
import './css/LandingPage.css';
import bgImage from '../assets/groceries-bg1.jpg'; 

const LandingPage = () => {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate('/home');
  };

  return (
    <div className="landing" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="overlay">
        <h1>Fresh groceries at your doorstep</h1>
        <button onClick={handleExplore}>Explore Now</button>
      </div>
    </div>
  );
};

export default LandingPage;
