const setPaginated = (query, queryParams, options) => {
    const {paginated} = options;

    if(paginated == 'true') {
        const countQuery = "SELECT COUNT(*) as count FROM (" + query + ") as countQuery"
        options.count = { countQuery, queryParams };
    }

    return { query, queryParams };
}

const setPagination = (query, queryParams, options) => {

    setPaginated(query, queryParams, options);

    let { porTanda, tanda } = options;

    if (porTanda && tanda) {
        const { limit, offset } = handleLimitOffset(tanda, porTanda);
        query += ` LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);
    }

    return { query, queryParams };
};

const setSearch = (query, queryParams, options, importantFields) => {

    let { textoBusqueda } = options;

    if (textoBusqueda) {

        textoBusqueda = textoBusqueda.replace(/\s+/g, ' ');
        
        textoBusqueda = textoBusqueda.split(' ').join('%')

        let counter = 0;

        for(const importantField of importantFields) {
            if(counter===0) {
                query += ` AND (${importantField} LIKE ?`;
                queryParams.push(`%${textoBusqueda}%`);
            }else {
                query += ` OR ${importantField} LIKE ?`;
                queryParams.push(`%${textoBusqueda}%`);
            }
            counter++;
        }
        
        query += `)`

    }

    return { query, queryParams };
}

const setStrictSearch = (query, queryParams, options, importantField) => {

    const { textoBusqueda } = options;

    if (textoBusqueda) {
        query += ` AND ${importantField} = ?`;
        queryParams.push(textoBusqueda);
    }

    return { query, queryParams };
}

const setOrderBy = (query, queryParams, importantFields) => {
    let counter = 0;
    for (let importantField of importantFields) {
        let isDescending = false;

        // Si el primer carácter es '!', indicamos que el orden debe ser descendente
        if (importantField[0] === '!') {
            isDescending = true;
            importantField = importantField.substring(1); // Eliminamos '!'
        }

        if (counter === 0) {
            query += ` ORDER BY ${importantField} IS NULL, ${importantField} = '', ${importantField}`;
        } else {
            query += `, ${importantField} IS NULL, ${importantField} = '', ${importantField}`;
        }

        // Aplicamos DESC si corresponde
        if (isDescending) {
            query += ` DESC`;
        }

        counter++;
    }
    return { query, queryParams };
};


const setGetNews = (query, queryParams, prefix) => {
    prefix = prefix ? prefix + '.' : '';
    query += ` ORDER BY ${prefix}updated_on DESC`;
    return { query, queryParams };
}

const setPaginationAndSearch = (query, queryParams, options, ...importantFields) => {
    let queryAndParams = { query, queryParams };
    queryAndParams = setSearch(queryAndParams.query, queryAndParams.queryParams, options, importantFields);
    queryAndParams = setPagination(queryAndParams.query, queryAndParams.queryParams, options);
    return queryAndParams;
};

const setPaginationAndOrderBy = (query, queryParams, options, ...importantFields) => {
    let queryAndParams = { query, queryParams };
    queryAndParams = setOrderBy(queryAndParams.query, queryAndParams.queryParams, importantFields);
    queryAndParams = setPagination(queryAndParams.query, queryAndParams.queryParams, options);

    return queryAndParams;
};

const setPaginationAndNews = (query, queryParams, options, prefix = '') => {
    let queryAndParams = { query, queryParams };
    queryAndParams = setGetNews(queryAndParams.query, queryAndParams.queryParams, prefix);
    queryAndParams = setPagination(queryAndParams.query, queryAndParams.queryParams, options);
    return queryAndParams;
}

const setSearchAndOrderBy = (query, queryParams, options, ...importantFields) => {
    let queryAndParams = { query, queryParams };
    queryAndParams = setSearch(queryAndParams.query, queryAndParams.queryParams, options, importantFields);
    queryAndParams = setOrderBy(queryAndParams.query, queryAndParams.queryParams, importantFields);

    return queryAndParams;
};

const setPaginationSearchAndOrderBy = (query, queryParams, options, ...importantFields) => {
    let queryAndParams = { query, queryParams };
    queryAndParams = setSearch(queryAndParams.query, queryAndParams.queryParams, options, importantFields);
    queryAndParams = setOrderBy(queryAndParams.query, queryAndParams.queryParams, importantFields);
    queryAndParams = setPagination(queryAndParams.query, queryAndParams.queryParams, options);
    return queryAndParams;
};

const setPaginationStrictSearchAndOrderBy = (query, queryParams, options, importantField) => {
    let queryAndParams = { query, queryParams };
    queryAndParams = setStrictSearch(queryAndParams.query, queryAndParams.queryParams, options, importantField);
    queryAndParams = setOrderBy(queryAndParams.query, queryAndParams.queryParams, importantField);
    queryAndParams = setPagination(queryAndParams.query, queryAndParams.queryParams, options, importantField);
    return queryAndParams;
};

const setPaginationSearchAndOrderBySeparate = (query, queryParams, options, searchFields, orderFields) => {
    let queryAndParams = { query, queryParams };
    queryAndParams = setSearch(queryAndParams.query, queryAndParams.queryParams, options, searchFields);
    queryAndParams = setOrderBy(queryAndParams.query, queryAndParams.queryParams, orderFields);
    queryAndParams = setPagination(queryAndParams.query, queryAndParams.queryParams, options);
    return queryAndParams;
};

const handleLimitOffset = (tanda, porTanda) => {
    const limit = parseInt(porTanda);
    tanda = parseInt(tanda) <= 0 ? 1 : parseInt(tanda);
    const offset = (tanda - 1) * limit;
    return { limit, offset };
};

export {
    setPagination,
    setSearch,
    setOrderBy,
    setGetNews,
    setPaginationAndSearch,
    setPaginationAndOrderBy,
    setPaginationAndNews,
    setSearchAndOrderBy,
    setPaginationSearchAndOrderBy,
    setPaginationStrictSearchAndOrderBy,
    setPaginationSearchAndOrderBySeparate
};
