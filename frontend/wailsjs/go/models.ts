export namespace config {
	
	export class Config {
	    db_type: string;
	    host: string;
	    port: number;
	    database: string;
	    username: string;
	    his_type: string;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.db_type = source["db_type"];
	        this.host = source["host"];
	        this.port = source["port"];
	        this.database = source["database"];
	        this.username = source["username"];
	        this.his_type = source["his_type"];
	    }
	}

}

export namespace domain {
	
	export class CIDRequest {
	    pid: string;
	
	    static createFrom(source: any = {}) {
	        return new CIDRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pid = source["pid"];
	    }
	}
	export class ExcelResponse {
	    headers: string[];
	    rows: any[];
	
	    static createFrom(source: any = {}) {
	        return new ExcelResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.headers = source["headers"];
	        this.rows = source["rows"];
	    }
	}

}

export namespace main {
	
	export class UpdateInfo {
	    version: string;
	    url: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.version = source["version"];
	        this.url = source["url"];
	    }
	}

}

