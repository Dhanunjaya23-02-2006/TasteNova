class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
        this.totalCount = 0;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // Advanced filtering for >=, <=, etc.
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt'); // Default sorting
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 50; // Default limit 50 to prevent huge payloads, but large enough for UI tables
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

// Utility function to apply headers safely without modifying JSON shape
const sendPaginatedResponse = async (res, apiFeaturesObj, Model) => {
    // Count total documents ignoring skip and limit
    // Use getFilter() (Mongoose 6+) with fallback to getQuery() for backward compat
    const filterConditions = apiFeaturesObj.query.getFilter ? apiFeaturesObj.query.getFilter() : apiFeaturesObj.query.getQuery();
    const countQuery = Model.find(filterConditions);
    const totalCount = await countQuery.countDocuments();
    
    const docs = await apiFeaturesObj.query;
    
    const limit = apiFeaturesObj.queryString.limit * 1 || 50;
    const page = apiFeaturesObj.queryString.page * 1 || 1;
    const totalPages = Math.ceil(totalCount / limit);

    // Inject pagination metadata into headers
    res.set('X-Total-Count', totalCount);
    res.set('X-Total-Pages', totalPages);
    res.set('X-Current-Page', page);
    res.set('Access-Control-Expose-Headers', 'X-Total-Count, X-Total-Pages, X-Current-Page');

    return res.json(docs);
};

module.exports = { APIFeatures, sendPaginatedResponse };
