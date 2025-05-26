import { addDbAgent, isDbAgent, getForumMessagesFromDb,
  postForumMessageToDb, closeSupportRequestInDb} from '../data-access/db.js';
import { getAllTechReports, deleteDbTicket, addDbTicket, editDbTicket, isDbAgentexist, addOneDbAgent, getDbRequestFromOneUser, setDbRatingOnPost } from '../services/techSupportService.js';

// get all tickets.
export async function getTechSuppot(req, res) {
    
    try {

        const techSup = await getAllTechReports();
        return res.status(200).json(techSup);

    } catch (err) {
        console.error('Tech-Support Service Error:', err.message);
  
        const statusCode = err.status || 500;
        const message = err.message || 'An unexpected error occurred in the Tech-Support Service';

        return res.status(statusCode).json({
            error: true,
            message
        });
    }
}

// add single ticket.
export async function addTicket(req, res) {
    
    // const type = req.query.type;
    // const name = req.query.name;
    // const email = req.query.email;
    // const category = req.query.category;
    // const description = req.query.description;
    // const images = req.query.images;

    const { type, name, email, category, description, images } = req.body;

    console.log('', name, email, category, description, images);

    if (!type || !name || !email || !category || !description) {
        return res.status(400).json({ error: 'all fields must be filled' });
    }

    try {
        const result = await addDbTicket(type, name, email, category, description, images);
        
        if (result.success) {
        return res.status(200).json({ ticketId: result.ticket.id });
        } else {
        return res.status(404).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error adding ticket:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// edit sigle ticket.
export async function editTicket(req, res) {
    const id = parseInt(req.query.id, 10);
    const content = req.query.content;

    if (!id || !content) {
        return res.status(400).json({ error: 'id and content must be not null values.' });
    }

    try {
        const result = await editDbTicket(id, content);

        if (result.success) {
        return res.status(200).json(result);
        } else {
        return res.status(404).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error editing ticket:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// delete single ticket.
export async function deleteTicket(req, res) {
    const id = parseInt(req.query.id, 10);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ticket ID (use ?id=)' });
    }

    try {
        const result = await deleteDbTicket(id);

        if (result.success) {
        return res.status(200).json(result);
        } else {
        return res.status(404).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error deleting ticket:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// check if the agent exist.
export async function isAgent(req, res) {
    const email = req.query.email;
    if (!email) {
        return res.status(400).json({ error: 'email must be not null value.' });
    }

    try {
        const result = await isDbAgentexist(email);

        if (result.success) {
        return res.status(200).json(result);
        } else {
        return res.status(404).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error finding agent:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// add agent.
export async function addAgent(req, res) {
    const email = req.query.email;
    if (!email) {
        return res.status(400).json({ error: 'email must be not null value.' });
    }

    try {
        const result = await addOneDbAgent(email);

        if (result.success) {
        return res.status(200).json(result);
        } else {
        return res.status(404).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error adding agent:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


// get all requests from specific user.
export async function getRequestsFromOneUser(req, res) {
    const email = req.query.email;
    if (!email) {
        return res.status(400).json({ error: 'email must be not null value.' });
    }

    try {
        const result = await getDbRequestFromOneUser(email);

        if (result.success) {
        return res.status(200).json(result);
        } else {
        return res.status(404).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error getting requests:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


// get forum messages
export async function getForumMessages(req, res) {
  const pid = parseInt(req.query.pid, 10);

  if (!pid) {
    return res.status(400).json({ error: 'pid must be a valid number.' });
  }

  try {
    const result = await getForumMessagesFromDb(pid);

    if (result.success) {
      return res.status(200).json({ messages: result.messages });
    } else {
      return res.status(404).json({ error: result.error });
    }

  } catch (error) {
    console.error('Error getting forum messages:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// post a forum message
export async function postForumMessage(req, res) {
  const pid = parseInt(req.query.pid, 10);
  const name = req.query.name;
  const content = req.query.content;
  const isAgent = req.query.isAgent === 'true';

  if (!pid || !name || !content) {
    return res.status(400).json({ error: 'pid, name and content must be provided.' });
  }

  try {
    const result = await postForumMessageToDb(pid, name, content, isAgent);

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ error: result.error });
    }

  } catch (error) {
    console.error('Error posting forum message:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// close a support request
export async function closeSupportRequest(req, res) {
  const id = parseInt(req.query.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'id must be a valid number.' });
  }

  try {
    const result = await closeSupportRequestInDb(id);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error closing ticket:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// close a support request
export async function editRatingOnDb(req, res) {
  const id = parseInt(req.query.pid, 10);
  const rating = parseInt(req.query.rating, 10);

  if (isNaN(id) || isNaN(rating)) {
    return res.status(400).json({ error: 'id or rating must be a valid number.' });
  }

  try {
    const result = await setDbRatingOnPost(id, rating);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error closing ticket:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

