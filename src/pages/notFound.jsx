import { Link } from "react-router-dom";

const NotFound = () => {
    return <div>Page not found!
        <Link to="/" className="bg-blue-400 p-3">Home Page</Link>
    </div>;
  };
  
export default NotFound;