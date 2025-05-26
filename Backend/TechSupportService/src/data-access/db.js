import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

// Your external PostgreSQL URL
const connectionString = process.env.DB_CON_STR;

// Create a pool of connections
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Initialize DB: create table if it doesn't exist
async function initDB() {
  //const del = `DROP TABLE IF EXISTS tickets;`;
  //const del2 = `DROP TABLE IF EXISTS forum;`;

  const posts = `
  CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    type INT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    status INT NOT NULL,
    urgency INT NOT NULL,
    imgs BYTEA[4],
    rating INT DEFAULT 0
  );
`;

  const agents = `
    CREATE TABLE IF NOT EXISTS agents (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL
    );
  `;

  const forum = `
    CREATE TABLE IF NOT EXISTS forum (
      id SERIAL PRIMARY KEY,
      pid INT NOT NULL,
      name TEXT NOT NULL,
      content TEXT NOT NULL
    );
  `;

  await pool.query(posts);
  await pool.query(agents);
  await pool.query(forum);

  console.log("[ ✅ ] Table 'tickets' is ready.");
  console.log("[ ✅ ] Table 'agents' is ready.");
  console.log("[ ✅ ] Table 'forum' is ready.");
}

// Call it immediately
initDB().catch(console.error);

// Fetch all tech reports
export async function getAllTechReports() {
  const res = await pool.query('SELECT * FROM tickets');
  console.log('[ 📨 ] Recived GET Req'); // for dbg, delete later!
  return res.rows;
}

// add one ticket.
export async function addOneDbTicket(
  type,
  name,
  email,
  category,
  description,
  images
) {
  let uType = 0;
  const status = 1;
  let urgency = 0;
  const date = new Date(Date.now() + 3 * 60 * 60 * 1000);

  // status codes
  const high = 1;
  const medium = 2;
  const low = 3;

  // status codes for user-type
  const user = 1;
  const lead = 2;

  // img format
  // const imagesJSON = [
  //   images.img1 ? Buffer.from(images.img1, "hex") : null,
  //   images.img2 ? Buffer.from(images.img2, "hex") : null,
  //   images.img3 ? Buffer.from(images.img3, "hex") : null,
  //   images.img4 ? Buffer.from(images.img4, "hex") : null,
  // ];

  const imagesJSON = Array.isArray(images)
  ? images.map((img) => {
      if (!img || typeof img !== 'string' || !img.startsWith('data:image/')) {
        return null;
      }

      try {
        const base64 = img.split(',')[1]; // remove the "data:image/...;base64," part
        return Buffer.from(base64, 'base64');
      } catch (err) {
        return null;
      }
    })
  : [null, null, null, null];

  if (
    category === 'Security concern' ||
    category === 'Crash or freezing issue' ||
    category === 'Installation issue'
  ) {
    urgency = high;
  } else if (
    category === 'Update or version issue' ||
    category === 'Integration issue with third-party software' ||
    category === 'Bug report'
  ) {
    urgency = medium;
  } else {
    urgency = low;
  }

  if (type === user) uType = user;
  else uType = lead;

  try {
    const res = await pool.query(
      'INSERT INTO tickets (type, name, email, category, description, date, status, urgency, imgs) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [
        uType,
        name,
        email,
        category,
        description,
        date,
        status,
        urgency,
        imagesJSON,
      ]
    );

    // Insert the original user message into forum
    await pool.query(
      'INSERT INTO forum (pid, name, content) VALUES ($1, $2, $3)',
      [res.rows[0].id, name, description]
    );

    console.log('[ 🎫 ] New ticket added:', res.rows[0]);
    return {
      success: true,
      ticket: res.rows[0],
    };
  } catch (err) {
    console.error('[ ⚡ ] Error adding ticket:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

// edit one ticket.
export async function editOneDbTicket(id, content) {
  try {
    const res = await pool.query(
      'UPDATE tickets SET content = $1 WHERE id = $2 RETURNING *',
      [content, id]
    );

    if (res.rowCount === 0) {
      throw new Error(`Ticket with id ${id} does not exist.`);
    }

    console.log('[ 🩹 ] Patching ticket:', res.rows[0]);
    return {
      success: true,
      message: `Ticket ${id} content was updated.`,
      updatedTicket: res.rows[0],
    };
  } catch (err) {
    console.error('[ ⚠ ] Error patching ticket:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

// delete one ticket.
export async function deleteOneDbTicket(id) {
  try {
    const res = await pool.query(
      'DELETE FROM tickets WHERE id = $1 RETURNING *',
      [id]
    );

    if (res.rowCount === 0) {
      throw new Error(`Ticket with id ${id} does not exist.`);
    }

    console.log('[ 🗑️  ] Recived DEL req');
    return {
      success: true,
      message: `Ticket with id ${id} was deleted.`,
      deletedTicket: res.rows[0],
    };
  } catch (err) {
    console.error('[ ⚡ ] Error deleting ticket:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function isDbAgent(email) {
  try {
    const res = await pool.query('SELECT FROM agents WHERE email = $1', [
      email,
    ]);

    console.log('[ 🔎 ] Recived look for agent req');

    if (res.rowCount === 0) {
      return {
        success: true,
        agent: false,
      };
    } else {
      return {
        success: true,
        agent: true,
      };
    }
  } catch (err) {
    console.error('[ ⚡ ] Error finding agent:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function addDbAgent(email) {
  try {
    const res = await pool.query(
      'INSERT INTO agents (email) VALUES ($1) RETURNING *',
      [email]
    );

    console.log('[ 🗽 ] Recived add new agent req');

    if (res.rowCount > 0) {
      return {
        success: true,
        agent: email,
      };
    } else {
      return {
        success: true,
        agent: 0,
      };
    }
  } catch (err) {
    console.error('[ ⚡ ] Error adding agent:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function getDbRequests(email) {
  try {
    const res = await pool.query('SELECT * FROM tickets WHERE email = $1', [
      email,
    ]);

    return {
      success: true,
      userRequest: res.rows, // will be [] if no rows found
    };
  } catch (err) {
    console.error('[ ⚡ ] Error getting requests:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function getForumMessagesFromDb(pid) {
  try {
    const result = await pool.query(
      'SELECT * FROM forum WHERE pid = $1 ORDER BY id ASC',
      [pid]
    );
    return {
      success: true,
      messages: result.rows,
    };
  } catch (err) {
    console.error('[ ⚡ ] Error fetching forum messages:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function postForumMessageToDb(pid, name, content, isAgent) {
  try {
    // If it is a agent and the status is still open, we will update it to "in progress."
    const ticketRes = await pool.query(
      'SELECT status FROM tickets WHERE id = $1',
      [pid]
    );
    const ticket = ticketRes.rows[0];
    if (isAgent && ticket?.status === 1) {
      await pool.query('UPDATE tickets SET status = 2 WHERE id = $1', [pid]);
    }

    await pool.query(
      'INSERT INTO forum (pid, name, content) VALUES ($1, $2, $3)',
      [pid, name, content]
    );

    return { success: true };
  } catch (err) {
    console.error('[ ⚡ ] Error posting forum message:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

// Close support ticket (status = 3)
export async function closeSupportRequestInDb(id) {
  try {
    const res = await pool.query(
      'UPDATE tickets SET status = 3 WHERE id = $1 RETURNING *',
      [id]
    );

    if (res.rowCount === 0) {
      return {
        success: false,
        error: `Ticket with id ${id} does not exist.`,
      };
    }

    console.log(`[ 🔒 ] Ticket ${id} marked as closed.`);
    return {
      success: true,
      closedTicket: res.rows[0],
    };
  } catch (err) {
    console.error('[ ⚡ ] Error closing ticket:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function rateDbService(pid, rating) {
  try {
    const res = await pool.query(
      'UPDATE tickets SET rating = $1 WHERE id = $2 RETURNING *',
      [rating, pid]
    );

    if (res.rowCount === 0) {
      return {
        success: false,
        error: `Ticket with id ${pid} does not exist.`,
      };
    }

    console.log(`[ ⭐ ] Ticket ${pid} rated with ${rating} star(s).`);
    return {
      success: true,
      ratedTicket: res.rows[0],
    };
  } catch (err) {
    console.error('[ ⚡ ] Error rating ticket:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

export { initDB }; // for testing purposes
