import { conn } from "../db/conn.js";
import { Response } from "../models/response.js";
import { displayLogs } from "../shared/logger.js";

const getPagination = (req, options = {}) => {
    if (req.query.pt && req.query.t) {
        options.porTanda = req.query.pt;
        options.tanda = req.query.t;
    }
    if (req.query.paginated) {
        options.paginated = true;
    }
    return options;
}

const getSearch = (req, options = {}) => {
    if (req.query.q) {
        options.textoBusqueda = req.query.q;
    }
    return options;
}

const getPaginated = (req, options = {}) => {
    if(req.query.p) {
        options.paginated = req.query.p;
    }
    return options;
}

const getPaginationAndSearch = (req) => {
    let options = {};
    options = getPagination(req, options);
    options = getSearch(req, options);
    options = getPaginated(req, options);
    return options;
}

// CRUD ACTIONS

const getAllFrom = async (req, res, getAllFunction, options) => {
    let error;
    try {
        let body;
        if (options && options.paginated == 'true') {
            body = {
                content: await getAllFunction(options),
                ...await addPaginationData(options)
            }
        } else {
            body = await getAllFunction(options);
        }

        const response = new Response({
            body,
            userId: req.user
        });
        const resBody = response.getBody();
        if (resBody.length === 0 || (resBody.content && resBody.content.length === 0)) {
            response.setBody(null);
            response.setStatus(404)
        }
        if (resBody.errorCode) {
            response.setStatus(resBody.errorCode);
            response.setBody(resBody.message);
            error = { message: resBody.message }
        }
        res.status(response.getStatus()).send(response);
    } catch (err) {
        error = err;
        const errorResponse = new Response({
            body: err.message,
            status: 500,
            userId: req.user
        });
        res.status(errorResponse.getStatus()).send(errorResponse);
    } finally {
        displayLogs(req, res, error);
    }
}

const getOneFrom = async (req, res, getOneFunction, ...options) => {
    let error;
    try {
        const response = new Response({
            body: await getOneFunction(...options),
            userId: req.user
        });
        const resBody = response.getBody();
        if (!resBody) {
            response.setStatus(404);
        }
        if (resBody && resBody.errorCode) {
            response.setStatus(resBody.errorCode);
            response.setBody(resBody.message);
            error = { message: resBody.message }
        }
        res.status(response.getStatus()).send(response);
    } catch (err) {
        error = err;
        const errorResponse = new Response({
            body: err.message,
            status: 500,
            userId: req.user
        });
        res.status(errorResponse.getStatus()).send(errorResponse);
    } finally {
        displayLogs(req, res, error);
    }
}

const create = async (req, res, createFunction) => {
    let error;
    try {
        const insertion = req.body;
        const response = new Response({
            body: await createFunction(insertion),
            status: 201,
            userId: req.user
        });
        const resBody = response.getBody();
        if (resBody && resBody.errorCode) {
            response.setStatus(resBody.errorCode);
            response.setBody(resBody.message);
            error = { message: resBody.message }
        }
        res.status(response.getStatus()).send(response);
    } catch (err) {
        error = err;
        const errorResponse = new Response({
            body: err.message,
            status: 500,
            userId: req.user
        });
        res.status(errorResponse.getStatus()).send(errorResponse);
    } finally {
        displayLogs(req, res, error);
    }
}

const deleteOne = async (req, res, deleteFunction) => {
    let error;
    try {
        const { id } = req.params
        const response = new Response({
            body: await deleteFunction(id),
            userId: req.user
        })
        const resBody = response.getBody();
        if (resBody && resBody.errorCode) {
            response.setStatus(resBody.errorCode);
            response.setBody(resBody.message);
            error = { message: resBody.message }
        }
        res.status(response.getStatus()).send(response);
    } catch (err) {
        error = err;
        const errorResponse = new Response({
            body: err.message,
            status: 500,
            userId: req.user
        });
        res.status(errorResponse.getStatus()).send(errorResponse);
    } finally {
        displayLogs(req, res, error);
    }
}

const update = async (req, res, updateFunction) => {
    let error;
    try {
        const { id } = req.params
        const updatedObj = req.body;
        const response = new Response({
            body: await updateFunction(id, updatedObj),
            userId: req.user
        })
        const resBody = response.getBody();
        if (resBody && resBody.errorCode) {
            response.setStatus(resBody.errorCode);
            response.setBody(resBody.message);
            error = { message: resBody.message }
        }
        res.status(response.getStatus()).send(response);
    } catch (err) {
        error = err;
        const errorResponse = new Response({
            body: err.message,
            status: 500,
            userId: req.user
        });
        res.status(errorResponse.getStatus()).send(errorResponse);
    } finally {
        displayLogs(req, res, error);
    }
}

const patch = async (req, res, patchFunction, ...conditions) => {
    let error;
    try {
        const response = new Response({
            body: await patchFunction(...conditions),
            userId: req.user
        })
        const resBody = response.getBody();
        if (resBody && resBody.errorCode) {
            response.setStatus(resBody.errorCode);
            response.setBody(resBody.message);
            error = { message: resBody.message }
        }
        res.status(response.getStatus()).send(response);
    } catch (err) {
        error = err;
        const errorResponse = new Response({
            body: err.message,
            status: 500,
            userId: req.user
        });
        res.status(errorResponse.getStatus()).send(errorResponse);
    } finally {
        displayLogs(req, res, error);
    }
}

const addPaginationData = async (options) => {
    if (options.tanda && options.porTanda) {
        if (options.tanda == 0) {
            options.tanda = 1;
        }
        if(options.paginated == 'true') {
            const { countQuery, queryParams } = options.count;
            const [[{count}]] = await conn.query(countQuery, queryParams);

        const response = {};
        if (count) {
            response.currentPage = parseInt(options.tanda);
            response.totalPages = Math.ceil(count / options.porTanda);
        }
        return response;
        }
    }
}

export { getOneFrom, getAllFrom, create, deleteOne, update, patch, getPagination, getSearch, getPaginationAndSearch }
