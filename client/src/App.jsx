import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary"; 


import FlashMessage from "./components/common/FlashMessage";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import RouteLoader from './components/common/RouteLoader';

import EmailLoginForm from './pages/EmailLoginForm'; 
import ProfilePage from "./pages/Profiles/ProfilePage";
import EditProfile from "./pages/Profiles/EditProfile";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import SocialLogin from "./pages/SocialLogin";
import LoginForm from "./pages/LoginForm";
import SignupForm from "./pages/SignupForm";
import AdminDashboard from "./Store Management/Pages/AdminDashboard";
import ProductManagement from "./Store Management/Pages/ProductManagement"
import CartPage from "./pages/CartPage";
import OrderSummary from "./pages/OrderSummary";
import ProductDetail from "./pages/ProductDetail";
import OrderSuccessPage from "./components/Handlers/OrderSuccessPage";
import OrderHistory from "./pages/order management/OrderHistory";
import ScrollToAnchor from "./components/common/ScrollToTop";
import SearchResults from "./pages/SearchResults";
import NotFound from "./components/Handlers/NotFound";
import ErrorPage from "./components/Handlers/ErrorPage";


import AboutUs from "./components/partials/pages/AboutUs";
import Careers from "./components/partials/pages/Careers";
import Blog from "./components/partials/pages/Blog";
import TermsAndConditions from "./components/partials/pages/TermsAndConditions";
import PrivacyPolicy from "./components/partials/pages/PrivacyPolicy";
import ReturnsCentre from "./components/partials/pages/ReturnsCentre";
import HelpPage from "./components/partials/pages/HelpPage";
import PrivateRoute from "./components/auth/PrivateRoute";


const App = () => {
  const [flash, setFlash] = useState(null);

  const showFlash = (message, type = "success") => {
    setFlash({ message, type });
  };

  const clearFlash = () => {
    setFlash(null);
  };

  return (
    <div className="page-wrapper">
      <Router>
        <ScrollToAnchor/>
        
          {/* <RouteLoader /> */}
        {flash && (
          <FlashMessage message={flash.message} type={flash.type} onClose={clearFlash} />
        )}

        <ErrorBoundary FallbackComponent={ErrorPage}>

        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<SocialLogin showFlash={showFlash} />} />
            <Route path="/signup" element={<SocialLogin showFlash={showFlash} />} />
            <Route path="/login-form" element={<LoginForm showFlash={showFlash} />} />
            <Route path="/signup-form" element={<SignupForm showFlash={showFlash} />} />
            <Route path="/login/email-otp" element={<EmailLoginForm showFlash={showFlash} />} />
            

            <Route path="/cart" element={<CartPage showFlash={showFlash}/>}/>
            <Route path="/products/:productId" element={<ProductDetail showFlash={showFlash}/>}/>
            <Route path="/search-results" element={<SearchResults />} />

        <Route element={<PrivateRoute />}>

            <Route path="/dashboard" element={<ProfilePage />} />
            <Route path="/edit-profile" element={<EditProfile showFlash={showFlash} />} />
            <Route path="/product-manager-dashboard" element={<ProductManagement showFlash={showFlash}/>} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />


            <Route path="/order-summary" element={<OrderSummary showFlash={showFlash}/>}/>

            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/order-history" element={<OrderHistory showFlash={showFlash}/>} />

         </Route>
          
            <Route path="/about-us" element={<AboutUs showFlash={showFlash}/>}/> 
            <Route path="/careers" element={<Careers />} showFlash={showFlash}/>
            <Route path="/blog" element={<Blog showFlash={showFlash}/>} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/returns-centre" element={<ReturnsCentre />} />
            <Route path="/help" element={<HelpPage />} />


            <Route path="*" element={<NotFound/>}/>
            
            
          </Routes>
        </main>

        <Footer />
      </ErrorBoundary>
      </Router>
    </div>
  );
};

export default App;
