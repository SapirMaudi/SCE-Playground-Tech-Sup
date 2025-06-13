import { Router } from 'express';
import {
  forwardAuthRequests,
  forwardLeadsRequests,
  forwardProductsRequests,
  forwardTechSupportRequests,
  ping,
} from '../controllers/gatewayController.js';


const router = Router();

router.use('/auth', forwardAuthRequests);
router.use('/products', forwardProductsRequests);
router.get('/ping', ping);


router.use('/leads', forwardLeadsRequests);
// Forward all /ts/* requests - for tech support.
router.use('/ts', forwardTechSupportRequests);


export default router;
