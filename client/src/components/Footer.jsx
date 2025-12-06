import { useState } from "react";
import { Link } from "react-router-dom";
import { FaLeaf, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      toast.success(t('footer.newsletter_success', "Subscribed successfully!"));
      setEmail("");
    } else {
      toast.error("Please enter a valid email address.");
    }
  };

  const navLinks = [
    { name: t('nav.home', "Home"), path: "/" },
    { name: t('nav.products', "Products"), path: "/products" },
    { name: t('nav.farmers', "Farmers"), path: "/farmers" },
    { name: t('nav.about', "About Us"), path: "/about" },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FaLeaf className="text-green-400 text-2xl" />
              <h3 className="text-xl font-bold">{t('footer.brand', 'KisanBazar')}</h3>
            </div>
            <p className="text-gray-400 mb-4">
              {t('footer.description', 'Connecting local farmers with consumers for fresh, sustainable produce.')}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              {t('footer.quick_links', 'Quick Links')}
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-green-400 transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              {t('footer.contact_us', 'Contact Us')}
            </h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-green-400 mt-1" />
                <span>Mysore, Karnataka</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-green-400" />
                <span>03241441444</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-green-400" />
                <span>info@freshharvestconnect.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              {t('footer.newsletter', 'Newsletter')}
            </h3>
            <p className="text-gray-400 mb-4">
              {t('footer.newsletter_desc', 'Subscribe for updates on fresh produce and local farmers.')}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.email_placeholder', 'Your email address')}
                className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                {t('footer.subscribe', 'Subscribe')}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {currentYear} KisanBazar. {t('footer.rights', 'All rights reserved.')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
