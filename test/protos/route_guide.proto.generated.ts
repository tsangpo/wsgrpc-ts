// GENERATED CODE -- DO NOT EDIT!

/* eslint-disable */
// @ts-nocheck

import {
  IStream as $IStream,
  IChannel as $IChannel,
  Reader as $Reader,
  Writer as $Writer,
} from "../../src";

export namespace routeguide {
  export interface IRouteGuide {
    getFeature(request: IPoint): Promise<IFeature>;

    listFeatures(request: IRectangle): Promise<$IStream<IFeature>>;

    recordRoute(request: $IStream<IPoint>): Promise<IRouteSummary>;

    routeChat(request: $IStream<IRouteNote>): Promise<$IStream<IRouteNote>>;
  }

  export class RouteGuide implements IRouteGuide {
    static addToServer(
      server: any,
      factory: (request: any) => Promise<IRouteGuide> | IRouteGuide
    ) {
      server.addService(
        "routeguide.RouteGuide",
        {
          getFeature: [Point.decode, Feature.encode, false, false],
          listFeatures: [Rectangle.decode, Feature.encode, false, true],
          recordRoute: [Point.decode, RouteSummary.encode, true, false],
          routeChat: [RouteNote.decode, RouteNote.encode, true, true],
        },
        factory
      );
    }

    constructor(private channel: $IChannel) {}

    async getFeature(request: IPoint): Promise<IFeature> {
      return await this.channel.rpcUnaryUnary(
        "routeguide.RouteGuide",
        "getFeature",
        Point.encode,
        Feature.decode,
        request
      );
    }

    async listFeatures(request: IRectangle): Promise<$IStream<IFeature>> {
      return await this.channel.rpcUnaryStream(
        "routeguide.RouteGuide",
        "listFeatures",
        Rectangle.encode,
        Feature.decode,
        request
      );
    }

    async recordRoute(request: $IStream<IPoint>): Promise<IRouteSummary> {
      return await this.channel.rpcStreamUnary(
        "routeguide.RouteGuide",
        "recordRoute",
        Point.encode,
        RouteSummary.decode,
        request
      );
    }

    async routeChat(
      request: $IStream<IRouteNote>
    ): Promise<$IStream<IRouteNote>> {
      return await this.channel.rpcStreamStream(
        "routeguide.RouteGuide",
        "routeChat",
        RouteNote.encode,
        RouteNote.decode,
        request
      );
    }
  }

  export interface IPoint {
    latitude?: number;
    longitude?: number;
  }
  export namespace Point {
    export function encode(message: IPoint, writer: $Writer): $Writer;
    export function encode(message: IPoint): Uint8Array;
    export function encode(
      message: IPoint,
      writer?: $Writer
    ): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      if (message.latitude != null && message.latitude != undefined)
        writer.uint32(8).int32(message.latitude);

      if (message.longitude != null && message.longitude != undefined)
        writer.uint32(16).int32(message.longitude);

      return end ? writer.finish() : writer;
    }

    export function decode(reader: Uint8Array): IPoint;
    export function decode(reader: $Reader, length: number): IPoint;
    export function decode(
      reader: Uint8Array | $Reader,
      length?: number
    ): IPoint {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length;
      const message = {} as any;

      while (reader.pos < end) {
        let tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.latitude = reader.int32();
            break;

          case 2:
            message.longitude = reader.int32();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    }
  }

  export interface IRectangle {
    lo?: IPoint;
    hi?: IPoint;
  }
  export namespace Rectangle {
    export function encode(message: IRectangle, writer: $Writer): $Writer;
    export function encode(message: IRectangle): Uint8Array;
    export function encode(
      message: IRectangle,
      writer?: $Writer
    ): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      if (message.lo != null && message.lo != undefined)
        Point.encode(message.lo, writer.uint32(10).fork()).ldelim();

      if (message.hi != null && message.hi != undefined)
        Point.encode(message.hi, writer.uint32(18).fork()).ldelim();
      return end ? writer.finish() : writer;
    }

    export function decode(reader: Uint8Array): IRectangle;
    export function decode(reader: $Reader, length: number): IRectangle;
    export function decode(
      reader: Uint8Array | $Reader,
      length?: number
    ): IRectangle {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length;
      const message = {} as any;

      while (reader.pos < end) {
        let tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.lo = Point.decode(reader, reader.uint32());
            break;

          case 2:
            message.hi = Point.decode(reader, reader.uint32());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    }
  }

  export interface IFeature {
    name?: string;
    location?: IPoint;
  }
  export namespace Feature {
    export function encode(message: IFeature, writer: $Writer): $Writer;
    export function encode(message: IFeature): Uint8Array;
    export function encode(
      message: IFeature,
      writer?: $Writer
    ): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      if (message.name != null && message.name != undefined)
        writer.uint32(10).string(message.name);

      if (message.location != null && message.location != undefined)
        Point.encode(message.location, writer.uint32(18).fork()).ldelim();
      return end ? writer.finish() : writer;
    }

    export function decode(reader: Uint8Array): IFeature;
    export function decode(reader: $Reader, length: number): IFeature;
    export function decode(
      reader: Uint8Array | $Reader,
      length?: number
    ): IFeature {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length;
      const message = {} as any;

      while (reader.pos < end) {
        let tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.name = reader.string();
            break;

          case 2:
            message.location = Point.decode(reader, reader.uint32());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    }
  }

  export interface IRouteNote {
    location?: IPoint;
    message?: string;
  }
  export namespace RouteNote {
    export function encode(message: IRouteNote, writer: $Writer): $Writer;
    export function encode(message: IRouteNote): Uint8Array;
    export function encode(
      message: IRouteNote,
      writer?: $Writer
    ): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      if (message.location != null && message.location != undefined)
        Point.encode(message.location, writer.uint32(10).fork()).ldelim();

      if (message.message != null && message.message != undefined)
        writer.uint32(18).string(message.message);

      return end ? writer.finish() : writer;
    }

    export function decode(reader: Uint8Array): IRouteNote;
    export function decode(reader: $Reader, length: number): IRouteNote;
    export function decode(
      reader: Uint8Array | $Reader,
      length?: number
    ): IRouteNote {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length;
      const message = {} as any;

      while (reader.pos < end) {
        let tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.location = Point.decode(reader, reader.uint32());
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
    }
  }

  export interface IRouteSummary {
    pointCount?: number;
    featureCount?: number;
    distance?: number;
    elapsedTime?: number;
  }
  export namespace RouteSummary {
    export function encode(message: IRouteSummary, writer: $Writer): $Writer;
    export function encode(message: IRouteSummary): Uint8Array;
    export function encode(
      message: IRouteSummary,
      writer?: $Writer
    ): $Writer | Uint8Array {
      const end = !writer;
      if (!writer) writer = $Writer.create();

      if (message.pointCount != null && message.pointCount != undefined)
        writer.uint32(8).int32(message.pointCount);

      if (message.featureCount != null && message.featureCount != undefined)
        writer.uint32(16).int32(message.featureCount);

      if (message.distance != null && message.distance != undefined)
        writer.uint32(24).int32(message.distance);

      if (message.elapsedTime != null && message.elapsedTime != undefined)
        writer.uint32(32).int32(message.elapsedTime);

      return end ? writer.finish() : writer;
    }

    export function decode(reader: Uint8Array): IRouteSummary;
    export function decode(reader: $Reader, length: number): IRouteSummary;
    export function decode(
      reader: Uint8Array | $Reader,
      length?: number
    ): IRouteSummary {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length;
      const message = {} as any;

      while (reader.pos < end) {
        let tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.pointCount = reader.int32();
            break;

          case 2:
            message.featureCount = reader.int32();
            break;

          case 3:
            message.distance = reader.int32();
            break;

          case 4:
            message.elapsedTime = reader.int32();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    }
  }
}
