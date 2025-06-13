import {
  Container,
  Row,
  Col,
  Button,
  Image,
  Stack,
  Badge,
  Modal,
} from 'react-bootstrap';
import { useState } from 'react';

export default function ProductPageUI({
  product,
  user,
  onEdit,
  onDelete,
  onViewLeads,
}) {
  const [selectedImage, setSelectedImage] = useState(product.image_url);
  const [showModal, setShowModal] = useState(false);
  const allImages = [
    product.image_url,
    ...(product.extra_images?.map((img) => img.image_url) || []),
  ];

  const handleDownloadProduct = () => {
    window.open(product.datasheet_url, '_blank');
  };

  return (
    <Container
      className="my-5"
      style={{
        borderRadius: '20px',
        border: 'solid 10px #b2fefa',
      }}
    >
      <Row className="align-items-center mb-3">
        <Col className="d-flex justify-content-between align-items-center">
          <h2 className="mb-0">{product.name}</h2>
          {user?.email === 'admin@gmail.com' && (
            <Stack direction="horizontal" gap={2}>
              <Button variant="info" onClick={onViewLeads}>
                Leads
              </Button>
              <Button variant="warning" onClick={onEdit}>
                <i className="bi bi-pencil"></i>
              </Button>
              <Button variant="danger" onClick={onDelete}>
                <i className="bi bi-trash"></i>
              </Button>
            </Stack>
          )}
        </Col>
      </Row>

      <Row>
        <Col md={12} className="d-flex flex-column align-items-center">
          <Image
            src={selectedImage}
            className="mb-3"
            fluid
            rounded
            onClick={() => setShowModal(true)}
            style={{
              maxHeight: '400px',
              objectFit: 'contain',
              width: '100%',
              maxWidth: '600px',
              cursor: 'zoom-in',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Stack
              direction="horizontal"
              gap={2}
              className="mb-3"
              style={{
                maxWidth: '600px',
                width: '100%',
                overflowX: 'auto',
                border: '1px solid #b2fefa',
                borderRadius: '10px',
                padding: '8px',
                backgroundColor: 'transparent',
              }}
            >
              {allImages.map((img, i) => (
                <Image
                  key={i}
                  src={img}
                  onClick={() => setSelectedImage(img)}
                  rounded
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border:
                      img === selectedImage
                        ? '3px solid #0d6efd'
                        : '1px solid #ccc',
                  }}
                />
              ))}
            </Stack>
          </div>
        </Col>
      </Row>

      <Row className="align-items-center">
        <Col md={9}>
          <Badge bg="secondary" className="mb-2">
            {product.category}
          </Badge>
          <h4>${product.price}</h4>
          <p>{product.description}</p>
        </Col>
        <Col md={3} className="text-md-end">
          <Button variant="info" size="lg" onClick={handleDownloadProduct}>
            Download Datasheet
          </Button>
        </Col>
      </Row>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="xl"
      >
        <Modal.Body
          className="text-center p-0 bg-dark"
          style={{ borderRadius: '8px' }}
        >
          <Image
            src={selectedImage}
            fluid
            style={{
              maxHeight: '90vh',
              width: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
}
