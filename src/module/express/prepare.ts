import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import {logm} from "../util/log.js";
import {BSON} from 'bson';

export default function (app: express.Application, config: any) {
    app.use(cors({
        credentials: true,
        origin: config.cors,
    }));
    app.use(helmet());
    app.use(morgan("combined", {
        "stream": {
            write: (str) => {
                logm('[$M] ' + str);
            }
        }
    }))
    app.use(express.raw({limit: '10mb'}))
    app.use(express.json({limit: "10mb"}));
    app.use(express.urlencoded({limit: "10mb", extended: true}));
    app.use((error, req, res, next) => res.status(500).send({error: error.message, code: 500}));
    app.use(cookieParser());
    app.use(compression({filter: () => true}));
    app.use((req, res, next) => {
        try {
            if (Buffer.isBuffer(req.body)) req.body = BSON.deserialize(req.body);
        } catch (e) {
            delete req.body;
        }
        next();
    });
}
