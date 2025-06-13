import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import './ProductCard.css';

function ProductCard(props) {
  return (
    <div className="product-card-wrapper">
      <Link to={`/products/${props.id}`}>
        <Card className="product-card">
          <Card.Img className="card-img" variant="top" src={props.img} />
          <Card.Body>
            <div className="title_and_price">
              <Card.Title>{props.name}</Card.Title>
              <Card.Title>{props.price} $</Card.Title>
            </div>
            <Card.Subtitle className="mb-2">{props.category}</Card.Subtitle>
          </Card.Body>
        </Card>
      </Link>
      {props.isAdmin && (
        <div className="lead-count-text">Leads: {props.lead_count}</div>
      )}
    </div>
  );
}

export default ProductCard;
