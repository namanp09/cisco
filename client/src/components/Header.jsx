import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Header = () => {
    return (
        <header className="header">
            <div className="logo-section">
                {/* Placeholder for a logo image */}
                <img src="/app_logo.jpg" alt="App Logo" style={{height: '30px', width: '30px', borderRadius: '5px', objectFit: 'cover'}} />
                <Link to="/">
                    Expense Splitter
                </Link>
            </div>
            <div className="user-button-container">
                <UserButton afterSignOutUrl="/sign-in" />
            </div>
        </header>
    );
};

export default Header;