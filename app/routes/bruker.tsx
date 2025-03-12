import { Link } from "react-router";

export default function Behandling() {
  return (
    <p>
      Du må velge en bruker, f.eks. <Link to="/bruker/17051412345">17051412345</Link>
    </p>
  );
}
