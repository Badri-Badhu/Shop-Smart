import './layoutcss/Footer.css';

const Footer = () => {
  return (
    <footer className="shopSmart-footer">
      <div className="footer-top">
        <div className="footer-section">
          <h4>Shop Smart</h4>
          <p>Delivering freshness to your doorstep.</p>
        </div>

        <div className="footer-section">
          <h4>Get to Know Us</h4>
          <ul>
            <li><a href="/about-us">About Us</a></li>
            <li><a href="/careers">Careers</a></li>
            <li><a href="/blog">Blog</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Let Us Help You</h4>
          <ul>
            <li><a href="/dashboard">Your Account</a></li>
            <li><a href="/returns-centre">Returns Centre</a></li>
            <li><a href="/help">Help</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Connect</h4>
          <div className="social-icons">
            <a href="https://www.facebook.com/people/Badri-Badhu/pfbid033Ao8anmaTBKSBCbJqbcMwrji2NSSn8Cot5nbBNrnDEvtcf7W8WkecfqeEsDjn4JYl/?rdid=XEAKgd2CqRqqmMK3&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1KCCxuctvU%2F" target='_blank'><i className="fab fa-facebook-f"></i></a>
            <a href="https://www.instagram.com/mr_obeanto/" target='_blank'><i className="fab fa-instagram"></i></a>
            <a href="https://x.com/Badri_Badhu" target='_blank'><i className="fab fa-twitter"></i></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Shop Smart. All rights reserved.</p>
        <p><a href="/terms-and-conditions">Terms & Conditions</a> | <a href="/privacy-policy">Privacy Policy</a></p>
      </div>
    </footer>
  );
};

export default Footer;
