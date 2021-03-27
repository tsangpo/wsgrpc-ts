/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const test = $root.test = (() => {

    /**
     * Namespace test.
     * @exports test
     * @namespace
     */
    const test = {};

    test.DataFrame = (function() {

        /**
         * Properties of a DataFrame.
         * @memberof test
         * @interface IDataFrame
         * @property {number|null} [callID] DataFrame callID
         * @property {test.DataFrame.IHeader|null} [header] DataFrame header
         * @property {Array.<test.DataFrame.ITrailer>|null} [trailer] DataFrame trailer
         * @property {Uint8Array|null} [body] DataFrame body
         * @property {Array.<number>|null} [nnn] DataFrame nnn
         */

        /**
         * Constructs a new DataFrame.
         * @memberof test
         * @classdesc Represents a DataFrame.
         * @implements IDataFrame
         * @constructor
         * @param {test.IDataFrame=} [properties] Properties to set
         */
        function DataFrame(properties) {
            this.trailer = [];
            this.nnn = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DataFrame callID.
         * @member {number} callID
         * @memberof test.DataFrame
         * @instance
         */
        DataFrame.prototype.callID = 0;

        /**
         * DataFrame header.
         * @member {test.DataFrame.IHeader|null|undefined} header
         * @memberof test.DataFrame
         * @instance
         */
        DataFrame.prototype.header = null;

        /**
         * DataFrame trailer.
         * @member {Array.<test.DataFrame.ITrailer>} trailer
         * @memberof test.DataFrame
         * @instance
         */
        DataFrame.prototype.trailer = $util.emptyArray;

        /**
         * DataFrame body.
         * @member {Uint8Array} body
         * @memberof test.DataFrame
         * @instance
         */
        DataFrame.prototype.body = $util.newBuffer([]);

        /**
         * DataFrame nnn.
         * @member {Array.<number>} nnn
         * @memberof test.DataFrame
         * @instance
         */
        DataFrame.prototype.nnn = $util.emptyArray;

        /**
         * Creates a new DataFrame instance using the specified properties.
         * @function create
         * @memberof test.DataFrame
         * @static
         * @param {test.IDataFrame=} [properties] Properties to set
         * @returns {test.DataFrame} DataFrame instance
         */
        DataFrame.create = function create(properties) {
            return new DataFrame(properties);
        };

        /**
         * Encodes the specified DataFrame message. Does not implicitly {@link test.DataFrame.verify|verify} messages.
         * @function encode
         * @memberof test.DataFrame
         * @static
         * @param {test.IDataFrame} message DataFrame message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DataFrame.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.callID != null && Object.hasOwnProperty.call(message, "callID"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.callID);
            if (message.header != null && Object.hasOwnProperty.call(message, "header"))
                $root.test.DataFrame.Header.encode(message.header, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.trailer != null && message.trailer.length)
                for (let i = 0; i < message.trailer.length; ++i)
                    $root.test.DataFrame.Trailer.encode(message.trailer[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.body != null && Object.hasOwnProperty.call(message, "body"))
                writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.body);
            if (message.nnn != null && message.nnn.length) {
                writer.uint32(/* id 5, wireType 2 =*/42).fork();
                for (let i = 0; i < message.nnn.length; ++i)
                    writer.int32(message.nnn[i]);
                writer.ldelim();
            }
            return writer;
        };

        /**
         * Encodes the specified DataFrame message, length delimited. Does not implicitly {@link test.DataFrame.verify|verify} messages.
         * @function encodeDelimited
         * @memberof test.DataFrame
         * @static
         * @param {test.IDataFrame} message DataFrame message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DataFrame.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DataFrame message from the specified reader or buffer.
         * @function decode
         * @memberof test.DataFrame
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {test.DataFrame} DataFrame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DataFrame.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.test.DataFrame();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.callID = reader.int32();
                    break;
                case 2:
                    message.header = $root.test.DataFrame.Header.decode(reader, reader.uint32());
                    break;
                case 3:
                    if (!(message.trailer && message.trailer.length))
                        message.trailer = [];
                    message.trailer.push($root.test.DataFrame.Trailer.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.body = reader.bytes();
                    break;
                case 5:
                    if (!(message.nnn && message.nnn.length))
                        message.nnn = [];
                    if ((tag & 7) === 2) {
                        let end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.nnn.push(reader.int32());
                    } else
                        message.nnn.push(reader.int32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DataFrame message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof test.DataFrame
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {test.DataFrame} DataFrame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DataFrame.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DataFrame message.
         * @function verify
         * @memberof test.DataFrame
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DataFrame.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.callID != null && message.hasOwnProperty("callID"))
                if (!$util.isInteger(message.callID))
                    return "callID: integer expected";
            if (message.header != null && message.hasOwnProperty("header")) {
                let error = $root.test.DataFrame.Header.verify(message.header);
                if (error)
                    return "header." + error;
            }
            if (message.trailer != null && message.hasOwnProperty("trailer")) {
                if (!Array.isArray(message.trailer))
                    return "trailer: array expected";
                for (let i = 0; i < message.trailer.length; ++i) {
                    let error = $root.test.DataFrame.Trailer.verify(message.trailer[i]);
                    if (error)
                        return "trailer." + error;
                }
            }
            if (message.body != null && message.hasOwnProperty("body"))
                if (!(message.body && typeof message.body.length === "number" || $util.isString(message.body)))
                    return "body: buffer expected";
            if (message.nnn != null && message.hasOwnProperty("nnn")) {
                if (!Array.isArray(message.nnn))
                    return "nnn: array expected";
                for (let i = 0; i < message.nnn.length; ++i)
                    if (!$util.isInteger(message.nnn[i]))
                        return "nnn: integer[] expected";
            }
            return null;
        };

        /**
         * Creates a DataFrame message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof test.DataFrame
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {test.DataFrame} DataFrame
         */
        DataFrame.fromObject = function fromObject(object) {
            if (object instanceof $root.test.DataFrame)
                return object;
            let message = new $root.test.DataFrame();
            if (object.callID != null)
                message.callID = object.callID | 0;
            if (object.header != null) {
                if (typeof object.header !== "object")
                    throw TypeError(".test.DataFrame.header: object expected");
                message.header = $root.test.DataFrame.Header.fromObject(object.header);
            }
            if (object.trailer) {
                if (!Array.isArray(object.trailer))
                    throw TypeError(".test.DataFrame.trailer: array expected");
                message.trailer = [];
                for (let i = 0; i < object.trailer.length; ++i) {
                    if (typeof object.trailer[i] !== "object")
                        throw TypeError(".test.DataFrame.trailer: object expected");
                    message.trailer[i] = $root.test.DataFrame.Trailer.fromObject(object.trailer[i]);
                }
            }
            if (object.body != null)
                if (typeof object.body === "string")
                    $util.base64.decode(object.body, message.body = $util.newBuffer($util.base64.length(object.body)), 0);
                else if (object.body.length)
                    message.body = object.body;
            if (object.nnn) {
                if (!Array.isArray(object.nnn))
                    throw TypeError(".test.DataFrame.nnn: array expected");
                message.nnn = [];
                for (let i = 0; i < object.nnn.length; ++i)
                    message.nnn[i] = object.nnn[i] | 0;
            }
            return message;
        };

        /**
         * Creates a plain object from a DataFrame message. Also converts values to other types if specified.
         * @function toObject
         * @memberof test.DataFrame
         * @static
         * @param {test.DataFrame} message DataFrame
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DataFrame.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults) {
                object.trailer = [];
                object.nnn = [];
            }
            if (options.defaults) {
                object.callID = 0;
                object.header = null;
                if (options.bytes === String)
                    object.body = "";
                else {
                    object.body = [];
                    if (options.bytes !== Array)
                        object.body = $util.newBuffer(object.body);
                }
            }
            if (message.callID != null && message.hasOwnProperty("callID"))
                object.callID = message.callID;
            if (message.header != null && message.hasOwnProperty("header"))
                object.header = $root.test.DataFrame.Header.toObject(message.header, options);
            if (message.trailer && message.trailer.length) {
                object.trailer = [];
                for (let j = 0; j < message.trailer.length; ++j)
                    object.trailer[j] = $root.test.DataFrame.Trailer.toObject(message.trailer[j], options);
            }
            if (message.body != null && message.hasOwnProperty("body"))
                object.body = options.bytes === String ? $util.base64.encode(message.body, 0, message.body.length) : options.bytes === Array ? Array.prototype.slice.call(message.body) : message.body;
            if (message.nnn && message.nnn.length) {
                object.nnn = [];
                for (let j = 0; j < message.nnn.length; ++j)
                    object.nnn[j] = message.nnn[j];
            }
            return object;
        };

        /**
         * Converts this DataFrame to JSON.
         * @function toJSON
         * @memberof test.DataFrame
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DataFrame.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        DataFrame.Header = (function() {

            /**
             * Properties of a Header.
             * @memberof test.DataFrame
             * @interface IHeader
             * @property {string|null} [service] Header service
             * @property {string|null} [method] Header method
             */

            /**
             * Constructs a new Header.
             * @memberof test.DataFrame
             * @classdesc Represents a Header.
             * @implements IHeader
             * @constructor
             * @param {test.DataFrame.IHeader=} [properties] Properties to set
             */
            function Header(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Header service.
             * @member {string} service
             * @memberof test.DataFrame.Header
             * @instance
             */
            Header.prototype.service = "";

            /**
             * Header method.
             * @member {string} method
             * @memberof test.DataFrame.Header
             * @instance
             */
            Header.prototype.method = "";

            /**
             * Creates a new Header instance using the specified properties.
             * @function create
             * @memberof test.DataFrame.Header
             * @static
             * @param {test.DataFrame.IHeader=} [properties] Properties to set
             * @returns {test.DataFrame.Header} Header instance
             */
            Header.create = function create(properties) {
                return new Header(properties);
            };

            /**
             * Encodes the specified Header message. Does not implicitly {@link test.DataFrame.Header.verify|verify} messages.
             * @function encode
             * @memberof test.DataFrame.Header
             * @static
             * @param {test.DataFrame.IHeader} message Header message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Header.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.service != null && Object.hasOwnProperty.call(message, "service"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.service);
                if (message.method != null && Object.hasOwnProperty.call(message, "method"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.method);
                return writer;
            };

            /**
             * Encodes the specified Header message, length delimited. Does not implicitly {@link test.DataFrame.Header.verify|verify} messages.
             * @function encodeDelimited
             * @memberof test.DataFrame.Header
             * @static
             * @param {test.DataFrame.IHeader} message Header message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Header.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Header message from the specified reader or buffer.
             * @function decode
             * @memberof test.DataFrame.Header
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {test.DataFrame.Header} Header
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Header.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.test.DataFrame.Header();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.service = reader.string();
                        break;
                    case 2:
                        message.method = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Header message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof test.DataFrame.Header
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {test.DataFrame.Header} Header
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Header.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Header message.
             * @function verify
             * @memberof test.DataFrame.Header
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Header.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.service != null && message.hasOwnProperty("service"))
                    if (!$util.isString(message.service))
                        return "service: string expected";
                if (message.method != null && message.hasOwnProperty("method"))
                    if (!$util.isString(message.method))
                        return "method: string expected";
                return null;
            };

            /**
             * Creates a Header message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof test.DataFrame.Header
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {test.DataFrame.Header} Header
             */
            Header.fromObject = function fromObject(object) {
                if (object instanceof $root.test.DataFrame.Header)
                    return object;
                let message = new $root.test.DataFrame.Header();
                if (object.service != null)
                    message.service = String(object.service);
                if (object.method != null)
                    message.method = String(object.method);
                return message;
            };

            /**
             * Creates a plain object from a Header message. Also converts values to other types if specified.
             * @function toObject
             * @memberof test.DataFrame.Header
             * @static
             * @param {test.DataFrame.Header} message Header
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Header.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.service = "";
                    object.method = "";
                }
                if (message.service != null && message.hasOwnProperty("service"))
                    object.service = message.service;
                if (message.method != null && message.hasOwnProperty("method"))
                    object.method = message.method;
                return object;
            };

            /**
             * Converts this Header to JSON.
             * @function toJSON
             * @memberof test.DataFrame.Header
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Header.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Header;
        })();

        DataFrame.Trailer = (function() {

            /**
             * Properties of a Trailer.
             * @memberof test.DataFrame
             * @interface ITrailer
             * @property {string|null} [status] Trailer status
             * @property {string|null} [message] Trailer message
             */

            /**
             * Constructs a new Trailer.
             * @memberof test.DataFrame
             * @classdesc Represents a Trailer.
             * @implements ITrailer
             * @constructor
             * @param {test.DataFrame.ITrailer=} [properties] Properties to set
             */
            function Trailer(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Trailer status.
             * @member {string} status
             * @memberof test.DataFrame.Trailer
             * @instance
             */
            Trailer.prototype.status = "";

            /**
             * Trailer message.
             * @member {string} message
             * @memberof test.DataFrame.Trailer
             * @instance
             */
            Trailer.prototype.message = "";

            /**
             * Creates a new Trailer instance using the specified properties.
             * @function create
             * @memberof test.DataFrame.Trailer
             * @static
             * @param {test.DataFrame.ITrailer=} [properties] Properties to set
             * @returns {test.DataFrame.Trailer} Trailer instance
             */
            Trailer.create = function create(properties) {
                return new Trailer(properties);
            };

            /**
             * Encodes the specified Trailer message. Does not implicitly {@link test.DataFrame.Trailer.verify|verify} messages.
             * @function encode
             * @memberof test.DataFrame.Trailer
             * @static
             * @param {test.DataFrame.ITrailer} message Trailer message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Trailer.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.status);
                if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.message);
                return writer;
            };

            /**
             * Encodes the specified Trailer message, length delimited. Does not implicitly {@link test.DataFrame.Trailer.verify|verify} messages.
             * @function encodeDelimited
             * @memberof test.DataFrame.Trailer
             * @static
             * @param {test.DataFrame.ITrailer} message Trailer message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Trailer.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Trailer message from the specified reader or buffer.
             * @function decode
             * @memberof test.DataFrame.Trailer
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {test.DataFrame.Trailer} Trailer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Trailer.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.test.DataFrame.Trailer();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.status = reader.string();
                        break;
                    case 2:
                        message.message = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Trailer message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof test.DataFrame.Trailer
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {test.DataFrame.Trailer} Trailer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Trailer.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Trailer message.
             * @function verify
             * @memberof test.DataFrame.Trailer
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Trailer.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.status != null && message.hasOwnProperty("status"))
                    if (!$util.isString(message.status))
                        return "status: string expected";
                if (message.message != null && message.hasOwnProperty("message"))
                    if (!$util.isString(message.message))
                        return "message: string expected";
                return null;
            };

            /**
             * Creates a Trailer message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof test.DataFrame.Trailer
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {test.DataFrame.Trailer} Trailer
             */
            Trailer.fromObject = function fromObject(object) {
                if (object instanceof $root.test.DataFrame.Trailer)
                    return object;
                let message = new $root.test.DataFrame.Trailer();
                if (object.status != null)
                    message.status = String(object.status);
                if (object.message != null)
                    message.message = String(object.message);
                return message;
            };

            /**
             * Creates a plain object from a Trailer message. Also converts values to other types if specified.
             * @function toObject
             * @memberof test.DataFrame.Trailer
             * @static
             * @param {test.DataFrame.Trailer} message Trailer
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Trailer.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.status = "";
                    object.message = "";
                }
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = message.status;
                if (message.message != null && message.hasOwnProperty("message"))
                    object.message = message.message;
                return object;
            };

            /**
             * Converts this Trailer to JSON.
             * @function toJSON
             * @memberof test.DataFrame.Trailer
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Trailer.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Trailer;
        })();

        return DataFrame;
    })();

    return test;
})();

export { $root as default };
