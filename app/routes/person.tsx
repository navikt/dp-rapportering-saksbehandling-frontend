import { Link } from "react-router";

export default function Behandling() {
  return (
    <p>
      Du må velge en person, f.eks. <Link to="/person/17051412345/perioder">17051412345</Link>
    </p>
  );
}
