import * as db from '../data-access/db.js';

export async function getAllTechReports() {
    return await db.getAllTechReports();
}

export async function addDbTicket(type, name, email, category, description, images) {
    return await db.addOneDbTicket(type, name, email, category, description, images);
}

export async function editDbTicket(id, content) {
    return await db.editOneDbTicket(id, content);
}

export async function deleteDbTicket(id) {
    return await db.deleteOneDbTicket(id);
}

export async function isDbAgentexist(email) {
    return await db.isDbAgent(email);
}

export async function addOneDbAgent(email) {
    return await db.addDbAgent(email);
}

export async function getDbRequestFromOneUser(email) {
    return await db.getDbRequests(email);
}

export async function setDbRatingOnPost(pid, rating) {
    return await db.rateDbService(pid, rating);
}