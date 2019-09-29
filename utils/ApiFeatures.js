class ApiFeatures {
    constructor(query, reqQuery) {
        // Query object from mongoose
        this.query = query;

        // Original query from request object
        this.reqQuery = { ...reqQuery };

        // Filter fields
        this.excludedFields = ['sort', 'fields', 'page', 'limit'];

        // Operators list
        this.operatorsList = ['gte', 'gt', 'lte', 'lt'];
    }

    callQuery() {
        return this.query;
    }

    filter() {
        // Get new copy of request
        let newQuery = { ...this.reqQuery };

        // Filter fields that are commands
        this.excludedFields.forEach(el => delete newQuery[el]);

        // Get $ sign into mongodb operators
        const operatorsRegex = new RegExp(
            `\\b(${this.operatorsList.join('|')})\\b`,
            'g'
        );

        newQuery = JSON.stringify(newQuery);
        newQuery = newQuery.replace(operatorsRegex, match => `$${match}`);
        newQuery = JSON.parse(newQuery);

        // Update filter object
        this.query.find(newQuery);

        return this;
    }

    sort() {
        if (this.reqQuery.sort) {
            const sortBy = this.reqQuery.sort.replace(/,/g, ' ');
            this.query.sort(sortBy);
        } else {
            this.query.sort('-createdAt');
        }

        return this;
    }

    fields() {
        if (this.reqQuery.fields) {
            const fields = this.reqQuery.fields.replace(/,/g, ' ');
            this.query.select(fields);
        } else {
            this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        const page = this.reqQuery.page * 1 || 1;

        // User can specify until 100 responses, the default is 50
        let limit;
        if (this.reqQuery.limit) {
            limit =
                this.reqQuery.limit * 1 <= 100 ? this.reqQuery.limit * 1 : 100;
        } else {
            limit = 50;
        }

        const skip = (page - 1) * limit;
        this.query.skip(skip).limit(limit);

        return this;
    }

    getFilter() {
        return this.query.getFilter();
    }
}

module.exports = ApiFeatures;
