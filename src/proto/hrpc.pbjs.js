/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const hrpc = $root.hrpc = (() => {

    /**
     * Namespace hrpc.
     * @exports hrpc
     * @namespace
     */
    const hrpc = {};

    hrpc.DataFrame = (function() {

        /**
         * Properties of a DataFrame.
         * @memberof hrpc
         * @interface IDataFrame
         * @property {number} callID DataFrame callID
         * @property {hrpc.DataFrame.IHeader|null} [header] DataFrame header
         * @property {hrpc.DataFrame.ITrailer|null} [trailer] DataFrame trailer
         * @property {Uint8Array|null} [body] DataFrame body
         */

        /**
         * Constructs a new DataFrame.
         * @memberof hrpc
         * @classdesc Represents a DataFrame.
         * @implements IDataFrame
         * @constructor
         * @param {hrpc.IDataFrame=} [properties] Properties to set
         */
        function DataFrame(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DataFrame callID.
         * @member {number} callID
         * @memberof hrpc.DataFrame
         * @instance
         */
        DataFrame.prototype.callID = 0;

        /**
         * DataFrame header.
         * @member {hrpc.DataFrame.IHeader|null|undefined} header
         * @memberof hrpc.DataFrame
         * @instance
         */
        DataFrame.prototype.header = null;

        /**
         * DataFrame trailer.
         * @member {hrpc.DataFrame.ITrailer|null|undefined} trailer
         * @memberof hrpc.DataFrame
         * @instance
         */
        DataFrame.prototype.trailer = null;

        /**
         * DataFrame body.
         * @member {Uint8Array} body
         * @memberof hrpc.DataFrame
         * @instance
         */
        DataFrame.prototype.body = $util.newBuffer([]);

        /**
         * Creates a new DataFrame instance using the specified properties.
         * @function create
         * @memberof hrpc.DataFrame
         * @static
         * @param {hrpc.IDataFrame=} [properties] Properties to set
         * @returns {hrpc.DataFrame} DataFrame instance
         */
        DataFrame.create = function create(properties) {
            return new DataFrame(properties);
        };

        /**
         * Encodes the specified DataFrame message. Does not implicitly {@link hrpc.DataFrame.verify|verify} messages.
         * @function encode
         * @memberof hrpc.DataFrame
         * @static
         * @param {hrpc.IDataFrame} message DataFrame message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DataFrame.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.callID);
            if (message.header != null && Object.hasOwnProperty.call(message, "header"))
                $root.hrpc.DataFrame.Header.encode(message.header, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.trailer != null && Object.hasOwnProperty.call(message, "trailer"))
                $root.hrpc.DataFrame.Trailer.encode(message.trailer, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.body != null && Object.hasOwnProperty.call(message, "body"))
                writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.body);
            return writer;
        };

        /**
         * Encodes the specified DataFrame message, length delimited. Does not implicitly {@link hrpc.DataFrame.verify|verify} messages.
         * @function encodeDelimited
         * @memberof hrpc.DataFrame
         * @static
         * @param {hrpc.IDataFrame} message DataFrame message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DataFrame.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DataFrame message from the specified reader or buffer.
         * @function decode
         * @memberof hrpc.DataFrame
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {hrpc.DataFrame} DataFrame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DataFrame.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.hrpc.DataFrame();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.callID = reader.int32();
                    break;
                case 2:
                    message.header = $root.hrpc.DataFrame.Header.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.trailer = $root.hrpc.DataFrame.Trailer.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.body = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("callID"))
                throw $util.ProtocolError("missing required 'callID'", { instance: message });
            return message;
        };

        /**
         * Decodes a DataFrame message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof hrpc.DataFrame
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {hrpc.DataFrame} DataFrame
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
         * @memberof hrpc.DataFrame
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DataFrame.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.callID))
                return "callID: integer expected";
            if (message.header != null && message.hasOwnProperty("header")) {
                let error = $root.hrpc.DataFrame.Header.verify(message.header);
                if (error)
                    return "header." + error;
            }
            if (message.trailer != null && message.hasOwnProperty("trailer")) {
                let error = $root.hrpc.DataFrame.Trailer.verify(message.trailer);
                if (error)
                    return "trailer." + error;
            }
            if (message.body != null && message.hasOwnProperty("body"))
                if (!(message.body && typeof message.body.length === "number" || $util.isString(message.body)))
                    return "body: buffer expected";
            return null;
        };

        /**
         * Creates a DataFrame message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof hrpc.DataFrame
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {hrpc.DataFrame} DataFrame
         */
        DataFrame.fromObject = function fromObject(object) {
            if (object instanceof $root.hrpc.DataFrame)
                return object;
            let message = new $root.hrpc.DataFrame();
            if (object.callID != null)
                message.callID = object.callID | 0;
            if (object.header != null) {
                if (typeof object.header !== "object")
                    throw TypeError(".hrpc.DataFrame.header: object expected");
                message.header = $root.hrpc.DataFrame.Header.fromObject(object.header);
            }
            if (object.trailer != null) {
                if (typeof object.trailer !== "object")
                    throw TypeError(".hrpc.DataFrame.trailer: object expected");
                message.trailer = $root.hrpc.DataFrame.Trailer.fromObject(object.trailer);
            }
            if (object.body != null)
                if (typeof object.body === "string")
                    $util.base64.decode(object.body, message.body = $util.newBuffer($util.base64.length(object.body)), 0);
                else if (object.body.length)
                    message.body = object.body;
            return message;
        };

        /**
         * Creates a plain object from a DataFrame message. Also converts values to other types if specified.
         * @function toObject
         * @memberof hrpc.DataFrame
         * @static
         * @param {hrpc.DataFrame} message DataFrame
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DataFrame.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.callID = 0;
                object.header = null;
                object.trailer = null;
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
                object.header = $root.hrpc.DataFrame.Header.toObject(message.header, options);
            if (message.trailer != null && message.hasOwnProperty("trailer"))
                object.trailer = $root.hrpc.DataFrame.Trailer.toObject(message.trailer, options);
            if (message.body != null && message.hasOwnProperty("body"))
                object.body = options.bytes === String ? $util.base64.encode(message.body, 0, message.body.length) : options.bytes === Array ? Array.prototype.slice.call(message.body) : message.body;
            return object;
        };

        /**
         * Converts this DataFrame to JSON.
         * @function toJSON
         * @memberof hrpc.DataFrame
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DataFrame.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        DataFrame.Header = (function() {

            /**
             * Properties of a Header.
             * @memberof hrpc.DataFrame
             * @interface IHeader
             * @property {string|null} [service] Header service
             * @property {string|null} [method] Header method
             */

            /**
             * Constructs a new Header.
             * @memberof hrpc.DataFrame
             * @classdesc Represents a Header.
             * @implements IHeader
             * @constructor
             * @param {hrpc.DataFrame.IHeader=} [properties] Properties to set
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
             * @memberof hrpc.DataFrame.Header
             * @instance
             */
            Header.prototype.service = "";

            /**
             * Header method.
             * @member {string} method
             * @memberof hrpc.DataFrame.Header
             * @instance
             */
            Header.prototype.method = "";

            /**
             * Creates a new Header instance using the specified properties.
             * @function create
             * @memberof hrpc.DataFrame.Header
             * @static
             * @param {hrpc.DataFrame.IHeader=} [properties] Properties to set
             * @returns {hrpc.DataFrame.Header} Header instance
             */
            Header.create = function create(properties) {
                return new Header(properties);
            };

            /**
             * Encodes the specified Header message. Does not implicitly {@link hrpc.DataFrame.Header.verify|verify} messages.
             * @function encode
             * @memberof hrpc.DataFrame.Header
             * @static
             * @param {hrpc.DataFrame.IHeader} message Header message or plain object to encode
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
             * Encodes the specified Header message, length delimited. Does not implicitly {@link hrpc.DataFrame.Header.verify|verify} messages.
             * @function encodeDelimited
             * @memberof hrpc.DataFrame.Header
             * @static
             * @param {hrpc.DataFrame.IHeader} message Header message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Header.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Header message from the specified reader or buffer.
             * @function decode
             * @memberof hrpc.DataFrame.Header
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {hrpc.DataFrame.Header} Header
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Header.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.hrpc.DataFrame.Header();
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
             * @memberof hrpc.DataFrame.Header
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {hrpc.DataFrame.Header} Header
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
             * @memberof hrpc.DataFrame.Header
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
             * @memberof hrpc.DataFrame.Header
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {hrpc.DataFrame.Header} Header
             */
            Header.fromObject = function fromObject(object) {
                if (object instanceof $root.hrpc.DataFrame.Header)
                    return object;
                let message = new $root.hrpc.DataFrame.Header();
                if (object.service != null)
                    message.service = String(object.service);
                if (object.method != null)
                    message.method = String(object.method);
                return message;
            };

            /**
             * Creates a plain object from a Header message. Also converts values to other types if specified.
             * @function toObject
             * @memberof hrpc.DataFrame.Header
             * @static
             * @param {hrpc.DataFrame.Header} message Header
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
             * @memberof hrpc.DataFrame.Header
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
             * @memberof hrpc.DataFrame
             * @interface ITrailer
             * @property {string|null} [status] Trailer status
             * @property {string|null} [message] Trailer message
             */

            /**
             * Constructs a new Trailer.
             * @memberof hrpc.DataFrame
             * @classdesc Represents a Trailer.
             * @implements ITrailer
             * @constructor
             * @param {hrpc.DataFrame.ITrailer=} [properties] Properties to set
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
             * @memberof hrpc.DataFrame.Trailer
             * @instance
             */
            Trailer.prototype.status = "";

            /**
             * Trailer message.
             * @member {string} message
             * @memberof hrpc.DataFrame.Trailer
             * @instance
             */
            Trailer.prototype.message = "";

            /**
             * Creates a new Trailer instance using the specified properties.
             * @function create
             * @memberof hrpc.DataFrame.Trailer
             * @static
             * @param {hrpc.DataFrame.ITrailer=} [properties] Properties to set
             * @returns {hrpc.DataFrame.Trailer} Trailer instance
             */
            Trailer.create = function create(properties) {
                return new Trailer(properties);
            };

            /**
             * Encodes the specified Trailer message. Does not implicitly {@link hrpc.DataFrame.Trailer.verify|verify} messages.
             * @function encode
             * @memberof hrpc.DataFrame.Trailer
             * @static
             * @param {hrpc.DataFrame.ITrailer} message Trailer message or plain object to encode
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
             * Encodes the specified Trailer message, length delimited. Does not implicitly {@link hrpc.DataFrame.Trailer.verify|verify} messages.
             * @function encodeDelimited
             * @memberof hrpc.DataFrame.Trailer
             * @static
             * @param {hrpc.DataFrame.ITrailer} message Trailer message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Trailer.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Trailer message from the specified reader or buffer.
             * @function decode
             * @memberof hrpc.DataFrame.Trailer
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {hrpc.DataFrame.Trailer} Trailer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Trailer.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.hrpc.DataFrame.Trailer();
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
             * @memberof hrpc.DataFrame.Trailer
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {hrpc.DataFrame.Trailer} Trailer
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
             * @memberof hrpc.DataFrame.Trailer
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
             * @memberof hrpc.DataFrame.Trailer
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {hrpc.DataFrame.Trailer} Trailer
             */
            Trailer.fromObject = function fromObject(object) {
                if (object instanceof $root.hrpc.DataFrame.Trailer)
                    return object;
                let message = new $root.hrpc.DataFrame.Trailer();
                if (object.status != null)
                    message.status = String(object.status);
                if (object.message != null)
                    message.message = String(object.message);
                return message;
            };

            /**
             * Creates a plain object from a Trailer message. Also converts values to other types if specified.
             * @function toObject
             * @memberof hrpc.DataFrame.Trailer
             * @static
             * @param {hrpc.DataFrame.Trailer} message Trailer
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
             * @memberof hrpc.DataFrame.Trailer
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

    hrpc.Endponit = (function() {

        /**
         * Properties of an Endponit.
         * @memberof hrpc
         * @interface IEndponit
         * @property {string|null} [url] Endponit url
         */

        /**
         * Constructs a new Endponit.
         * @memberof hrpc
         * @classdesc Represents an Endponit.
         * @implements IEndponit
         * @constructor
         * @param {hrpc.IEndponit=} [properties] Properties to set
         */
        function Endponit(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Endponit url.
         * @member {string} url
         * @memberof hrpc.Endponit
         * @instance
         */
        Endponit.prototype.url = "";

        /**
         * Creates a new Endponit instance using the specified properties.
         * @function create
         * @memberof hrpc.Endponit
         * @static
         * @param {hrpc.IEndponit=} [properties] Properties to set
         * @returns {hrpc.Endponit} Endponit instance
         */
        Endponit.create = function create(properties) {
            return new Endponit(properties);
        };

        /**
         * Encodes the specified Endponit message. Does not implicitly {@link hrpc.Endponit.verify|verify} messages.
         * @function encode
         * @memberof hrpc.Endponit
         * @static
         * @param {hrpc.IEndponit} message Endponit message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Endponit.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.url != null && Object.hasOwnProperty.call(message, "url"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.url);
            return writer;
        };

        /**
         * Encodes the specified Endponit message, length delimited. Does not implicitly {@link hrpc.Endponit.verify|verify} messages.
         * @function encodeDelimited
         * @memberof hrpc.Endponit
         * @static
         * @param {hrpc.IEndponit} message Endponit message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Endponit.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Endponit message from the specified reader or buffer.
         * @function decode
         * @memberof hrpc.Endponit
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {hrpc.Endponit} Endponit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Endponit.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.hrpc.Endponit();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.url = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Endponit message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof hrpc.Endponit
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {hrpc.Endponit} Endponit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Endponit.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Endponit message.
         * @function verify
         * @memberof hrpc.Endponit
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Endponit.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.url != null && message.hasOwnProperty("url"))
                if (!$util.isString(message.url))
                    return "url: string expected";
            return null;
        };

        /**
         * Creates an Endponit message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof hrpc.Endponit
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {hrpc.Endponit} Endponit
         */
        Endponit.fromObject = function fromObject(object) {
            if (object instanceof $root.hrpc.Endponit)
                return object;
            let message = new $root.hrpc.Endponit();
            if (object.url != null)
                message.url = String(object.url);
            return message;
        };

        /**
         * Creates a plain object from an Endponit message. Also converts values to other types if specified.
         * @function toObject
         * @memberof hrpc.Endponit
         * @static
         * @param {hrpc.Endponit} message Endponit
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Endponit.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.url = "";
            if (message.url != null && message.hasOwnProperty("url"))
                object.url = message.url;
            return object;
        };

        /**
         * Converts this Endponit to JSON.
         * @function toJSON
         * @memberof hrpc.Endponit
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Endponit.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Endponit;
    })();

    hrpc.Channel = (function() {

        /**
         * Properties of a Channel.
         * @memberof hrpc
         * @interface IChannel
         */

        /**
         * Constructs a new Channel.
         * @memberof hrpc
         * @classdesc Represents a Channel.
         * @implements IChannel
         * @constructor
         * @param {hrpc.IChannel=} [properties] Properties to set
         */
        function Channel(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Creates a new Channel instance using the specified properties.
         * @function create
         * @memberof hrpc.Channel
         * @static
         * @param {hrpc.IChannel=} [properties] Properties to set
         * @returns {hrpc.Channel} Channel instance
         */
        Channel.create = function create(properties) {
            return new Channel(properties);
        };

        /**
         * Encodes the specified Channel message. Does not implicitly {@link hrpc.Channel.verify|verify} messages.
         * @function encode
         * @memberof hrpc.Channel
         * @static
         * @param {hrpc.IChannel} message Channel message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Channel.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        /**
         * Encodes the specified Channel message, length delimited. Does not implicitly {@link hrpc.Channel.verify|verify} messages.
         * @function encodeDelimited
         * @memberof hrpc.Channel
         * @static
         * @param {hrpc.IChannel} message Channel message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Channel.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Channel message from the specified reader or buffer.
         * @function decode
         * @memberof hrpc.Channel
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {hrpc.Channel} Channel
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Channel.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.hrpc.Channel();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Channel message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof hrpc.Channel
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {hrpc.Channel} Channel
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Channel.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Channel message.
         * @function verify
         * @memberof hrpc.Channel
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Channel.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        /**
         * Creates a Channel message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof hrpc.Channel
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {hrpc.Channel} Channel
         */
        Channel.fromObject = function fromObject(object) {
            if (object instanceof $root.hrpc.Channel)
                return object;
            return new $root.hrpc.Channel();
        };

        /**
         * Creates a plain object from a Channel message. Also converts values to other types if specified.
         * @function toObject
         * @memberof hrpc.Channel
         * @static
         * @param {hrpc.Channel} message Channel
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Channel.toObject = function toObject() {
            return {};
        };

        /**
         * Converts this Channel to JSON.
         * @function toJSON
         * @memberof hrpc.Channel
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Channel.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Channel;
    })();

    hrpc.Simple = (function() {

        /**
         * Properties of a Simple.
         * @memberof hrpc
         * @interface ISimple
         */

        /**
         * Constructs a new Simple.
         * @memberof hrpc
         * @classdesc Represents a Simple.
         * @implements ISimple
         * @constructor
         * @param {hrpc.ISimple=} [properties] Properties to set
         */
        function Simple(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Creates a new Simple instance using the specified properties.
         * @function create
         * @memberof hrpc.Simple
         * @static
         * @param {hrpc.ISimple=} [properties] Properties to set
         * @returns {hrpc.Simple} Simple instance
         */
        Simple.create = function create(properties) {
            return new Simple(properties);
        };

        /**
         * Encodes the specified Simple message. Does not implicitly {@link hrpc.Simple.verify|verify} messages.
         * @function encode
         * @memberof hrpc.Simple
         * @static
         * @param {hrpc.ISimple} message Simple message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Simple.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        /**
         * Encodes the specified Simple message, length delimited. Does not implicitly {@link hrpc.Simple.verify|verify} messages.
         * @function encodeDelimited
         * @memberof hrpc.Simple
         * @static
         * @param {hrpc.ISimple} message Simple message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Simple.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Simple message from the specified reader or buffer.
         * @function decode
         * @memberof hrpc.Simple
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {hrpc.Simple} Simple
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Simple.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.hrpc.Simple();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Simple message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof hrpc.Simple
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {hrpc.Simple} Simple
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Simple.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Simple message.
         * @function verify
         * @memberof hrpc.Simple
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Simple.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        /**
         * Creates a Simple message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof hrpc.Simple
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {hrpc.Simple} Simple
         */
        Simple.fromObject = function fromObject(object) {
            if (object instanceof $root.hrpc.Simple)
                return object;
            return new $root.hrpc.Simple();
        };

        /**
         * Creates a plain object from a Simple message. Also converts values to other types if specified.
         * @function toObject
         * @memberof hrpc.Simple
         * @static
         * @param {hrpc.Simple} message Simple
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Simple.toObject = function toObject() {
            return {};
        };

        /**
         * Converts this Simple to JSON.
         * @function toJSON
         * @memberof hrpc.Simple
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Simple.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        Simple.OK = (function() {

            /**
             * Properties of a OK.
             * @memberof hrpc.Simple
             * @interface IOK
             */

            /**
             * Constructs a new OK.
             * @memberof hrpc.Simple
             * @classdesc Represents a OK.
             * @implements IOK
             * @constructor
             * @param {hrpc.Simple.IOK=} [properties] Properties to set
             */
            function OK(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Creates a new OK instance using the specified properties.
             * @function create
             * @memberof hrpc.Simple.OK
             * @static
             * @param {hrpc.Simple.IOK=} [properties] Properties to set
             * @returns {hrpc.Simple.OK} OK instance
             */
            OK.create = function create(properties) {
                return new OK(properties);
            };

            /**
             * Encodes the specified OK message. Does not implicitly {@link hrpc.Simple.OK.verify|verify} messages.
             * @function encode
             * @memberof hrpc.Simple.OK
             * @static
             * @param {hrpc.Simple.IOK} message OK message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OK.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                return writer;
            };

            /**
             * Encodes the specified OK message, length delimited. Does not implicitly {@link hrpc.Simple.OK.verify|verify} messages.
             * @function encodeDelimited
             * @memberof hrpc.Simple.OK
             * @static
             * @param {hrpc.Simple.IOK} message OK message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OK.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a OK message from the specified reader or buffer.
             * @function decode
             * @memberof hrpc.Simple.OK
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {hrpc.Simple.OK} OK
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OK.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.hrpc.Simple.OK();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a OK message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof hrpc.Simple.OK
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {hrpc.Simple.OK} OK
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OK.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a OK message.
             * @function verify
             * @memberof hrpc.Simple.OK
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            OK.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                return null;
            };

            /**
             * Creates a OK message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof hrpc.Simple.OK
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {hrpc.Simple.OK} OK
             */
            OK.fromObject = function fromObject(object) {
                if (object instanceof $root.hrpc.Simple.OK)
                    return object;
                return new $root.hrpc.Simple.OK();
            };

            /**
             * Creates a plain object from a OK message. Also converts values to other types if specified.
             * @function toObject
             * @memberof hrpc.Simple.OK
             * @static
             * @param {hrpc.Simple.OK} message OK
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            OK.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this OK to JSON.
             * @function toJSON
             * @memberof hrpc.Simple.OK
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            OK.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return OK;
        })();

        return Simple;
    })();

    hrpc.WS = (function() {

        /**
         * Constructs a new WS service.
         * @memberof hrpc
         * @classdesc Represents a WS
         * @extends $protobuf.rpc.Service
         * @constructor
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         */
        function WS(rpcImpl, requestDelimited, responseDelimited) {
            $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
        }

        (WS.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = WS;

        /**
         * Creates new WS service using the specified rpc implementation.
         * @function create
         * @memberof hrpc.WS
         * @static
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         * @returns {WS} RPC service. Useful where requests and/or responses are streamed.
         */
        WS.create = function create(rpcImpl, requestDelimited, responseDelimited) {
            return new this(rpcImpl, requestDelimited, responseDelimited);
        };

        /**
         * Callback as used by {@link hrpc.WS#getChannel}.
         * @memberof hrpc.WS
         * @typedef GetChannelCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {hrpc.Channel} [response] Channel
         */

        /**
         * Calls GetChannel.
         * @function getChannel
         * @memberof hrpc.WS
         * @instance
         * @param {hrpc.IEndponit} request Endponit message or plain object
         * @param {hrpc.WS.GetChannelCallback} callback Node-style callback called with the error, if any, and Channel
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(WS.prototype.getChannel = function getChannel(request, callback) {
            return this.rpcCall(getChannel, $root.hrpc.Endponit, $root.hrpc.Channel, request, callback);
        }, "name", { value: "GetChannel" });

        /**
         * Calls GetChannel.
         * @function getChannel
         * @memberof hrpc.WS
         * @instance
         * @param {hrpc.IEndponit} request Endponit message or plain object
         * @returns {Promise<hrpc.Channel>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link hrpc.WS#pullEvents}.
         * @memberof hrpc.WS
         * @typedef pullEventsCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {hrpc.Endponit} [response] Endponit
         */

        /**
         * Calls pullEvents.
         * @function pullEvents
         * @memberof hrpc.WS
         * @instance
         * @param {hrpc.Simple.IOK} request OK message or plain object
         * @param {hrpc.WS.pullEventsCallback} callback Node-style callback called with the error, if any, and Endponit
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(WS.prototype.pullEvents = function pullEvents(request, callback) {
            return this.rpcCall(pullEvents, $root.hrpc.Simple.OK, $root.hrpc.Endponit, request, callback);
        }, "name", { value: "pullEvents" });

        /**
         * Calls pullEvents.
         * @function pullEvents
         * @memberof hrpc.WS
         * @instance
         * @param {hrpc.Simple.IOK} request OK message or plain object
         * @returns {Promise<hrpc.Endponit>} Promise
         * @variation 2
         */

        return WS;
    })();

    return hrpc;
})();

export { $root as default };
