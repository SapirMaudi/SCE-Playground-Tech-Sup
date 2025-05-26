import express, { json } from 'express';
import cors from 'cors';
import { getTechSuppot, deleteTicket, addTicket, editTicket, isAgent, addAgent, getRequestsFromOneUser,  getForumMessages,
  postForumMessage, closeSupportRequest, 
  editRatingOnDb} from './controllers/techSupController.js';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 13250;

app.use(cors());
app.use(json({ limit: '12mb' }));

// add here routes.
app.get('/techsupport', getTechSuppot);
app.post('/techsupportadd', addTicket);
app.patch('/techsupportedit', editTicket);
app.delete('/techsupportdel', deleteTicket);
app.get('/techsupportisagent', isAgent);
app.post('/techsupportaddagent', addAgent);
app.get('/techsupportfetchuserrequests', getRequestsFromOneUser);
app.get('/gettechsupportforum', getForumMessages);
app.post('/posttechsupportforum', postForumMessage);
app.patch('/techsupportcloserequest', closeSupportRequest);
app.patch('/techsupportrate', editRatingOnDb);



app.listen(port, ()=> {
    console.log(`[ ✅ ] Tech-Support Service is running at port: ${  port}`);
});

export { app }; // for testing purposes
