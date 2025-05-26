import { useContext } from 'react';
import { StoreContext } from '../store/StoreContext';
import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import '../App.css';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function TechSupportPage() {
  const { user } = useContext(StoreContext); // Gets the logged in user from the context

  // Page states
  const agentPage = 1;
  const userPage = 2;
  const addRequestPage = 3;
  const loadingScreen = 5;

  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null); // null means no popup yet
  const [forumMessages, setForumMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const [requests, setRequests] = useState([]);

  const [enlargedImage, setEnlargedImage] = useState(null);

  //const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isLoadingAgentRequests, setIsLoadingAgentRequests] = useState(true);

  // star rating
  const [showRatingForm, setShowRatingForm] = useState(true);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // agent page requests.
  const [costumerReq, setCostumerReq] = useState([]);

  // All requests from all users - for agent dashboard
  const [tickets, setTickets] = useState([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const STATUS_COLORS = ['#0088FE', '#FFBB28', '#00C49F']; 
  const RATING_COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

  // page state modifier.
  const [pageState, setPageState] = useState(loadingScreen);

  const tempUrl = '/ts/techsupportadd/?name=';

  // Function to count the number of requests per status type
  const getStatusData = () => {
    // Initialize counters for each status
    const counts = { open: 0, inProgress: 0, closed: 0 };

    // Loop through all tickets and increment corresponding status counter
    tickets.forEach((ticket) => {
      if (ticket.status === 1) counts.open++;
      else if (ticket.status === 2) counts.inProgress++;
      else if (ticket.status === 3) counts.closed++;
    });

    // Return the data formatted for the PieChart
    return [
      { name: 'Open', value: counts.open },
      { name: 'In Progress', value: counts.inProgress },
      { name: 'Closed', value: counts.closed },
    ];
  };

  // Function to count how many requests received each star rating
  const getRatingData = () => {
    // Initialize counters for each rating level
    const counts = { oneStar: 0, twoStars: 0, threeStars: 0 };

    // Loop through all tickets and count ratings of 1, 2, and 3
    tickets.forEach((ticket) => {
      if (ticket.rating === 1) counts.oneStar++;
      else if (ticket.rating === 2) counts.twoStars++;
      else if (ticket.rating === 3) counts.threeStars++;
    });

    // Return the data formatted for the BarChart
    return [
      { name: '1 Star', value: counts.oneStar },
      { name: '2 Stars', value: counts.twoStars },
      { name: '3 Stars', value: counts.threeStars },
    ];
  };
  // Loading messages from the server when a request is selected
  useEffect(() => {
    if (!selectedRequest) return;

    async function fetchMessages() {
      setIsLoadingMessages(true); // Start loading
      try {
        const res = await api.get(
          `/ts/gettechsupportforum?pid=${selectedRequest.id}`
        );
        setForumMessages(res.data.messages);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      } finally {
        setIsLoadingMessages(false); // Stop loading
      }
    }

    fetchMessages();
  }, [selectedRequest]);

  // Checking if the user is an Agent
  useEffect(() => {
    async function getPageType() {
      if (!user?.email)
        // Prevent error if user or user.email is undefined
        return;

      const res = await api.get(`/ts/techsupportisagent/?email=${  user?.email}`);

      if (res?.data.agent === true) {
        setPageState(agentPage);
        try {
          const ticketRes = await api.get('/ts/techsupport');
          setTickets(ticketRes.data);
        } catch (e) {
          console.error('Error loading dashboard tickets', e);
        } finally {
          setIsLoadingDashboard(false);
        }
      } else setPageState(userPage);
    }

    getPageType();
  }, [user?.email, requests?.length, costumerReq?.length]);

  // Loading requests from the DB
  useEffect(() => {
    async function fetchRequests() {
      if (pageState === agentPage) {
        setIsLoadingAgentRequests(true);
        try {
          const res = await api.get('/ts/techsupport');

          res.data.sort((a, b) => a.urgency - b.urgency || a.id - b.id);

          setCostumerReq(res.data);
        } catch (err) {
          console.error(err);
          setError('Failed to load support requests');
        } finally {
          setIsLoadingAgentRequests(false);
        }
      }

      if (pageState === userPage) {
        setIsLoadingRequests(true);
        try {
          const res = await api.get(
            `/ts/techsupportfetchuserrequests/?email=${  user?.email}`
          );
          setRequests(res.data.userRequest);
        } catch (err) {
          console.error(err);
          setError('Failed to load support requests');
        } finally {
          setIsLoadingRequests(false);
        }
      }
    }

    fetchRequests();
  }, [pageState]);

  useEffect(() => {
    if (
      selectedRequest &&
      selectedRequest.status === 3 &&
      !selectedRequest.rating
    ) {
      setShowRatingForm(true);
    }
  }, [selectedRequest]);

  // Function to determine color by content
  const getStatusColor = (status) => {
    if (status === 1) return 'green';
    if (status === 2) return 'orange';
    else return 'red';
  };

  // convert urgency level into text
  const getUrgencyText = (level) => {
    if (level === 1) return 'high';

    if (level === 2) return 'medium';

    if (level === 3) return 'low';
  };

  // Clicking the Send button in the popup
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest) return;

    try {
      // Send new forum message
      await api.post(
        `/ts/posttechsupportforum?pid=${selectedRequest.id}&name=${
          user.firstName
        }&content=${newMessage}&isAgent=${pageState === agentPage}`
      );
      setNewMessage('');

      // Reload forum messages for the selected request
      const res = await api.get(
        `/ts/gettechsupportforum?pid=${selectedRequest.id}`
      );
      setForumMessages(res.data.messages);

      // If we're on the agent page, update the ticket list (to reflect status change)
      if (pageState === agentPage) {
        const updatedRes = await api.get('/ts/techsupport');

        // Sort the updated list by urgency and ID
        updatedRes.data.sort((a, b) => {
          if (a.urgency !== b.urgency) return a.urgency - b.urgency;
          return a.id - b.id;
        });

        // Save updated ticket list to state
        setCostumerReq(updatedRes.data);

        // So that the graphs on the dashboard will update automatically without refreshing
        setTickets(updatedRes.data);

        // Find the updated version of the selected request (with updated status)
        const updated = updatedRes.data.find(
          (r) => r.id === selectedRequest.id
        );
        if (updated) {
          setSelectedRequest(updated); // Update state so the popup shows the correct status
        }
      }
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  // Set a request to 'closed' status
  const handleCloseRequest = async () => {
    if (!selectedRequest) return;

    // Check if there's an unsent message
    if (newMessage.trim()) {
      alert(
        'Warning: You have an unsent message. Please send or discard it before closing.'
      );
      return;
    }

    try {
      // Update the ticket status in DB
      await api.patch(`/ts/techsupportcloserequest?id=${selectedRequest.id}`);

      // Refresh the ticket list
      const updatedRes = await api.get('/ts/techsupport');
      updatedRes.data.sort((a, b) => {
        if (a.urgency !== b.urgency) return a.urgency - b.urgency;
        return a.id - b.id;
      });
      setCostumerReq(updatedRes.data);

      // So that the graphs on the dashboard will update automatically without refreshing
      setTickets(updatedRes.data);

      // Update the selected request with new status (closed)
      const updated = updatedRes.data.find((r) => r.id === selectedRequest.id);
      if (updated) {
        setSelectedRequest(updated);
      }
    } catch (err) {
      console.error('Error closing the request', err);
    }
  };

  //form fields
  const [userType, setUserType] = useState('');
  const [issueCategory, setIssueCategory] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [images, setImages] = useState([]);

  const [previews, setPreviews] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [messageColor, setMessageColor] = useState('');

  const handleRemoveImage = (indexToRemove) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
    setPreviews((prevPreviews) =>
      prevPreviews.filter((_, index) => index !== indexToRemove)
    );
  };

  // Handle file change and preview
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const validFiles = [];
    const newPreviews = [];

    for (const file of newFiles) {
      // Stop if we already have 4 images total
      // if (files.length + validFiles.length >= 4) {
      //   setMessageText('You can upload up to 4 images only.');
      //   setMessageColor('red');
      //   break;
      // }

      // Validate size
      if (file.size > 3 * 1024 * 1024) {
        setMessageText('Each image must be under 3MB.');
        setMessageColor('red');
        continue;
      }

      // Validate type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setMessageText('Only JPG, PNG, and GIF files are allowed.');
        setMessageColor('red');
        continue;
      }

      validFiles.push(file);

      // Load preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === validFiles.length) {
          setPreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      setMessageText('');
      setMessageColor('');
    }
  };

  // Get urgency based on category
  const getUrgency = (category) => {
    const urgencyMap = {
      'Security concern': 'High',
      'Crash or freezing issue': 'High',
      'Installation issue': 'High',
      'Update or version issue': 'Medium',
      'Integration issue with third-party software': 'Medium',
      'Bug report': 'Medium',
      'Performance issue': 'Low',
      Other: 'Low',
    };
    return urgencyMap[category] || 'Low';
  };

  const [formSubmittedSuccessfully, setFormSubmittedSuccessfully] =
    useState(false);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userType || !issueCategory || description.length < 10) {
      setMessageText('Please fill out all required fields correctly.');
      setMessageColor('red');
      return;
    }

    if (description.length > 2000) {
      setMessageText('Please enter a maximum of 2000 characters');
      setMessageColor('red');
      return;
    }

    if (files.length > 4) {
      setMessageText('You can upload up to 4 images only.');
      setMessageColor('red');
      return;
    }

    for (const file of files) {
      if (file.size > 3 * 1024 * 1024) {
        setMessageText('Each image must be under 3MB.');
        setMessageColor('red');
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setMessageText('Only JPG, PNG, and GIF files are allowed.');
        setMessageColor('red');
        return;
      }
    }

    const base64Images = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })
      )
    );

    const requestId = `REQ-${Date.now()}`;
    const submissionTime = new Date().toLocaleString();

    const requestData = {
      requestId,
      userType,
      issueCategory,
      description,
      urgency: getUrgency(issueCategory),
      submissionTime,
      images: base64Images,
    };

    let uType = 0;

    if (userType === 'before') {
      uType = 2;
    } else {
      uType = 1;
    }

    const res = await api.post('/ts/techsupportadd', {
      type: uType,
      name: user?.firstName,
      email: user?.email,
      category: issueCategory,
      description,
      images: base64Images,
    });

    // So that the graphs on the dashboard will update automatically without refreshing
    const ticketRes = await api.get('/ts/techsupport');
    setTickets(ticketRes.data);

    // const res = await api.post(
    //   '/ts/techsupportadd?type=' +
    //     uType +
    //     '&name=' +
    //     user?.firstName +
    //     '&email=' +
    //     user?.email +
    //     '&category=' +
    //     issueCategory +
    //     '&description=' +
    //     description +
    //     '&images=' +
    //     images
    // );

    //setMessageText(`Request ${requestId} submitted successfully!`);
    //setMessageColor('green');
    setFormSubmittedSuccessfully(true);

    // Reset the form
    setUserType('');
    setIssueCategory('');
    setDescription('');
    setFiles([]);
    setPreviews([]);
  };

  // Reset form manually
  const resetForm = () => {
    setUserType('');
    setIssueCategory('');
    setDescription('');
    setFiles([]);
    setPreviews([]);
    setMessageText('');
    setFormSubmittedSuccessfully(false);
    setPageState(userPage); // Go back to the user page
  };

  const handleAddRequest = () => {
    setFormSubmittedSuccessfully(false);
    setPageState(addRequestPage);
  };

  if (pageState === agentPage) {
    return (
      <>
        <div className="tech-agent-requests-page">
          <h2 className="tech-client-requests-page-title">
            Welcome agent: {user?.firstName}
          </h2>

          <div className="tech-agent-content">
            {/* LEFT PANEL: type === 1 */}
            <div className="tech-left-agent-panel">
              <h2 className="tech-panel-title">Customers</h2>

              <div className="tech-request-header-row">
                <span className="tech-request-cell">Status</span>
                <span className="tech-request-cell">Category</span>
                <span className="tech-request-cell">Urgency</span>
                <span className="tech-request-cell">ID</span>
              </div>

              {isLoadingAgentRequests ? (
                <div className="tech-loading-messages">
                  <div className="spinner"></div>
                  <p className="tech-loading-text">Loading requests...</p>
                </div>
              ) : costumerReq.filter((req) => req.type === 1).length === 0 ? (
                <p className="tech-no-requests">No customer requests yet.</p>
              ) : (
                costumerReq
                  .filter((req) => req.type === 1)
                  .map((req) => (
                    <div
                      key={req.id}
                      className="tech-request-row"
                      onClick={() => setSelectedRequest(req)}
                    >
                      <span className="tech-request-cell">
                        <span
                          className={`tech-status-circle ${getStatusColor(
                            req.status
                          )}`}
                          style={{ marginRight: '8px' }}
                        ></span>
                      </span>
                      <span className="tech-request-cell">{req.category}</span>
                      <span className="tech-request-cell">
                        {getUrgencyText(req.urgency)}
                      </span>
                      <span className="tech-request-cell tech-request-id">
                        Request #{req.id}
                      </span>
                    </div>
                  ))
              )}
            </div>

            {/* RIGHT PANEL: type === 2 */}
            <div className="tech-right-agent-panel">
              <h2 className="tech-panel-title">Leads</h2>

              <div className="tech-request-header-row">
                <span className="tech-request-cell">Status</span>
                <span className="tech-request-cell">Category</span>
                <span className="tech-request-cell">Urgency</span>
                <span className="tech-request-cell">ID</span>
              </div>

              {isLoadingAgentRequests ? (
                <div className="tech-loading-messages">
                  <div className="spinner"></div>
                  <p className="tech-loading-text">Loading requests...</p>
                </div>
              ) : costumerReq.filter((req) => req.type === 2).length === 0 ? (
                <p className="tech-no-requests">No lead requests yet.</p>
              ) : (
                costumerReq
                  .filter((req) => req.type === 2)
                  .map((req) => (
                    <div
                      key={`${req.id  }-lead`}
                      className="tech-request-row"
                      onClick={() => setSelectedRequest(req)}
                    >
                      <span className="tech-request-cell">
                        <span
                          className={`tech-status-circle ${getStatusColor(
                            req.status
                          )}`}
                          style={{ marginRight: '8px' }}
                        ></span>
                      </span>
                      <span className="tech-request-cell">{req.category}</span>
                      <span className="tech-request-cell">
                        {getUrgencyText(req.urgency)}
                      </span>
                      <span className="tech-request-cell tech-request-id">
                        Request #{req.id}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
          <div className="tech-graphs-panel">
            <h3 className="tech-dashboard-total-requests">
              Total Requests: {tickets.length}
            </h3>

            <div className="tech-dashboard-chart">
              <h4>Status Distribution</h4>
              <PieChart width={300} height={250}>
                <Pie
                  data={getStatusData()}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {getStatusData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#4caf50', '#ff9800', '#f44336'][index % 3]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>

            <div className="tech-dashboard-chart">
              <h4>Ratings Breakdown</h4>
              <BarChart width={300} height={250} data={getRatingData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  {getRatingData().map((entry, index) => (
                    <Cell
                      key={`cell-bar-${index}`}
                      fill={['#f44336', '#ff9800', '#4caf50'][index % 3]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </div>
          </div>
        </div>

        {/* POPUP OUTSIDE THE PANEL */}
        {selectedRequest && (
          <>
            <div
              className="tech-view-request-overlay"
              onClick={() => {
                setSelectedRequest(null);
                setEnlargedImage(null);
              }}
            ></div>
            <div className="tech-view-request">
              <h3 className="tech-view-request-title">
                {selectedRequest.category || 'Request Category'}
              </h3>
              <p className="tech-view-request-subtitle">
                Date:{' '}
                {selectedRequest.date
                  .replace('T', ' At ')
                  .replace('Z', '')
                  .replace(/\.\d+$/, '') || 'Unknown'}{' '}
                | Urgency: {getUrgencyText(selectedRequest.urgency)}
              </p>

              <div className="tech-view-request-history">
                {isLoadingMessages ? (
                  <div className="tech-loading-messages">
                    <div className="spinner"></div>
                    <p className="tech-loading-text">Loading messages...</p>
                  </div>
                ) : (
                  forumMessages.map((msg, idx) => (
                    <p key={idx} className="tech-view-request-message">
                      <span className="tech-bold-label">{msg.name}:</span>{' '}
                      {msg.content}
                    </p>
                  ))
                )}
              </div>

              {selectedRequest.imgs && selectedRequest.imgs.length > 0 && (
                <div className="tech-view-request-images">
                  {selectedRequest.imgs.map((img, index) => {
                    if (!img || !img.data) return null;
                    const base64String = btoa(
                      new Uint8Array(img.data).reduce(
                        (data, byte) => data + String.fromCharCode(byte),
                        ''
                      )
                    );
                    return (
                      <img
                        key={index}
                        src={`data:image/jpeg;base64,${base64String}`}
                        alt={`Uploaded ${index + 1}`}
                        className="tech-view-request-image"
                        onClick={() => setEnlargedImage(base64String)}
                      />
                    );
                  })}
                </div>
              )}

              {enlargedImage && (
                <div
                  className="tech-image-modal"
                  onClick={() => setEnlargedImage(null)}
                >
                  <div
                    className="tech-image-modal-content"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={`data:image/jpeg;base64,${enlargedImage}`}
                      alt="Enlarged"
                      className="tech-image-enlarged"
                    />
                    <button
                      className="tech-image-close-btn"
                      onClick={() => setEnlargedImage(null)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {selectedRequest.status !== 3 ? (
                <>
                  <textarea
                    className="tech-view-request-textbox"
                    placeholder="Write your reply here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />

                  <div className="tech-view-request-buttons">
                    <button
                      className="tech-buttons"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </button>

                    <button
                      className="tech-buttons"
                      onClick={() => {
                        setSelectedRequest(null);
                        setEnlargedImage(null);
                      }}
                    >
                      Back
                    </button>

                    <button
                      className="tech-buttons"
                      onClick={handleCloseRequest}
                    >
                      Mark Request as Closed
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="tech-view-request-closed-msg">
                    This request is closed. No further messages can be sent.
                  </p>
                  <div className="tech-view-request-buttons">
                    <button
                      className="tech-buttons"
                      onClick={() => {
                        setSelectedRequest(null);
                        setEnlargedImage(null);
                      }}
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </>
    );
  }

  if (pageState === addRequestPage) {
    return (
      <div className="tech-form-container">
        <h1 className="tech-client-requests-page-title">
          Contact Technical Support
        </h1>

        {formSubmittedSuccessfully ? (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <h2 style={{ color: 'green' }}>Thank you for contacting us!</h2>
            <p>
              We have received your request and will get back to you shortly.
            </p>
            <button className="tech-buttons" onClick={resetForm}>
              Back to My Requests
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* User Type */}
            <label>User Type:</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              required
            >
              <option value="">Select...</option>
              <option value="before">Before Purchase</option>
              <option value="after">After Purchase</option>
            </select>

            {/* Issue Category */}
            <label>Issue Category:</label>
            <select
              value={issueCategory}
              onChange={(e) => setIssueCategory(e.target.value)}
              required
            >
              <option value="">Select an issue</option>
              <option value="Security concern">Security concern</option>
              <option value="Crash or freezing issue">
                Crash or freezing issue
              </option>
              <option value="Installation issue">Installation issue</option>
              <option value="Update or version issue">
                Update or version issue
              </option>
              <option value="Integration issue with third-party software">
                Integration issue with third-party software
              </option>
              <option value="Performance issue">Performance issue</option>
              <option value="Bug report">Bug report</option>
              <option value="Other">Other</option>
            </select>

            {/* Description */}
            <label>Description:</label>
            <textarea
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 2000)
                  setDescription(e.target.value);
                else {
                  setDescription(e.target.value);
                }
              }}
              minLength={10}
              maxLength={10000}
              required
            />
            <p
              style={{
                fontSize: '12px',
                color: description.length >= 2000 ? 'red' : '#555',
              }}
            >
              {description.length}/2000 characters
            </p>
            {description.length >= 2000 && (
              <p style={{ color: 'red', fontSize: '13px' }}>
                You've reached the maximum character limit.
              </p>
            )}

            {/* Upload Images */}
            <label>Upload Images (up to 4, each img max 3 mb's):</label>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.gif"
              onChange={handleFileChange}
            />

            {/* Previews */}
            <div id="tech-filePreview">
              {previews.map((src, idx) => (
                <div key={idx} className="tech-image-preview-container">
                  <img src={src} alt={`Preview ${idx + 1}`} />
                  <button
                    type="button"
                    className="tech-remove-image-btn"
                    onClick={() => handleRemoveImage(idx)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="tech-button-group">
              <button className="tech-buttons" type="submit">
                Submit
              </button>
              <button
                className="tech-buttons"
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Message display */}
        {!formSubmittedSuccessfully && (
          <div id="tech-message" style={{ color: messageColor }}>
            {messageText}
          </div>
        )}
      </div>
    );
  }

  if (pageState === userPage) {
    return (
      <>
        <div className="tech-client-requests-page">
          <h2 className="tech-client-requests-page-title">My Requests</h2>

          {error && <p className="tech-error">{error}</p>}

          {isLoadingRequests ? (
            <div className="tech-loading-messages">
              <div className="spinner"></div>
              <p className="tech-loading-text">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <p className="tech-no-requests">No requests yet.</p>
          ) : (
            <div className="tech-requests-list">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="tech-request-row"
                  onClick={() => {
                    setSelectedRequest({ ...req });
                    setRating(req.rating || 0);
                    setShowRatingForm(req.status === 3 && req.rating === 0);
                  }}
                >
                  <span
                    className={`tech-status-circle ${getStatusColor(
                      req.status
                    )}`}
                  ></span>
                  <span className="tech-request-category">{req.category}</span>
                  <span className="tech-request-id"> Request #{req.id}</span>
                </div>
              ))}
            </div>
          )}

          <div className="tech-add-request-container">
            <button className="tech-buttons" onClick={handleAddRequest}>
              Add Request +
            </button>
          </div>
        </div>

        {/* view request popup */}
        {selectedRequest && (
          <>
            <div
              className="tech-view-request-overlay"
              onClick={() => {
                setSelectedRequest(null);
                setEnlargedImage(null);
                setShowRatingForm(false);
              }}
            ></div>

            <div className="tech-view-request">
              <h3 className="tech-view-request-title">
                {selectedRequest.category || 'Request Category'}
              </h3>
              <p className="tech-view-request-subtitle">
                Date:{' '}
                {selectedRequest?.date
                  ?.replace('T', ' At ')
                  .replace('Z', '')
                  .replace(/\.\d+$/, '') || 'Unknown'}
              </p>
              <div className="tech-view-request-history">
                {isLoadingMessages ? (
                  <div className="tech-loading-messages">
                    <div className="spinner"></div>
                    <p className="tech-loading-text">Loading messages...</p>
                  </div>
                ) : (
                  forumMessages.map((msg, idx) => (
                    <p key={idx} className="tech-view-request-message">
                      <span className="tech-bold-label">{msg.name}:</span>{' '}
                      {msg.content}
                    </p>
                  ))
                )}
              </div>
              {selectedRequest.imgs && selectedRequest.imgs.length > 0 && (
                <div className="tech-view-request-images">
                  {selectedRequest.imgs.map((img, index) => {
                    if (!img || !img.data) return null;
                    const base64String = btoa(
                      new Uint8Array(img.data).reduce(
                        (data, byte) => data + String.fromCharCode(byte),
                        ''
                      )
                    );
                    return (
                      <img
                        key={index}
                        src={`data:image/jpeg;base64,${base64String}`}
                        alt={`Uploaded ${index + 1}`}
                        className="tech-view-request-image"
                        onClick={() => setEnlargedImage(base64String)}
                      />
                    );
                  })}
                </div>
              )}
              {enlargedImage && (
                <div
                  className="tech-image-modal"
                  onClick={() => setEnlargedImage(null)}
                >
                  <div
                    className="tech-image-modal-content"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={`data:image/jpeg;base64,${enlargedImage}`}
                      alt="Enlarged"
                      className="tech-image-enlarged"
                    />
                    <button
                      className="tech-image-close-btn"
                      onClick={() => setEnlargedImage(null)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {selectedRequest.status !== 3 ? (
                <>
                  <textarea
                    className="tech-view-request-textbox"
                    placeholder="Write your reply here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <div className="tech-view-request-buttons">
                    <button
                      className="tech-buttons"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </button>
                    <button
                      className="tech-buttons"
                      onClick={() => setSelectedRequest(null)}
                    >
                      Back
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="tech-view-request-closed-msg">
                    This request is closed. No further messages can be sent.
                  </p>
                  <div className="tech-view-request-buttons">
                    {selectedRequest.rating === 0 && (
                      <button
                        className="tech-buttons"
                        onClick={() => setShowRatingForm(true)}
                      >
                        Rate Our Service
                      </button>
                    )}
                    <button
                      className="tech-buttons"
                      onClick={() => setSelectedRequest(null)}
                    >
                      Back
                    </button>
                  </div>

                  {/* Rating popup */}
                  {showRatingForm && (
                    <div
                      className="tech-rating-overlay"
                      onClick={() => setShowRatingForm(false)}
                    >
                      <div
                        className="tech-rating-modal"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!ratingSubmitted ? (
                          <>
                            <h3 className="tech-rating-title">
                              Rate Our Service
                            </h3>
                            <p>Select 1 to 3 stars:</p>
                            <div className="tech-rating-stars">
                              {[1, 2, 3].map((star) => (
                                <span
                                  key={star}
                                  className={`star ${
                                    rating >= star ? 'selected' : ''
                                  }`}
                                  style={{
                                    cursor: 'pointer',
                                    color: rating >= star ? 'gold' : 'gray',
                                    fontSize: '24px',
                                    marginRight: '8px',
                                  }}
                                  onClick={() => setRating(star)}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <div className="tech-rating-buttons">
                              <button
                                className="tech-buttons"
                                disabled={rating === 0}
                                onClick={async () => {
                                  await api.patch(
                                    `/ts/techsupportrate?pid=${selectedRequest.id}&rating=${rating}`
                                  );
                                  setRatingSubmitted(true);
                                  setSelectedRequest((prev) => ({
                                    ...prev,
                                    rating,
                                  }));
                                  setRequests((prev) =>
                                    prev.map((req) =>
                                      req.id === selectedRequest.id
                                        ? { ...req, rating }
                                        : req
                                    )
                                  );
                                }}
                              >
                                Submit
                              </button>
                            </div>
                          </>
                        ) : (
                          <div
                            style={{ textAlign: 'center', marginTop: '20px' }}
                          >
                            <p style={{ color: 'green', fontSize: '16px' }}>
                              ✅ Thank you for your feedback!
                            </p>
                          </div>
                        )}

                        <button
                          className="tech-buttons"
                          onClick={() => {
                            setShowRatingForm(false);
                            setRatingSubmitted(false); // reset for next time
                          }}
                          style={{ marginTop: '20px' }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <div className="home-container">
      <h2>Loading...</h2>
      <img src="/loading-ts.gif"></img>
    </div>
  );
}
