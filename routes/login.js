const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const Usuario = require('../models/usuario');
const SEED = require('../config/config').SEED;

app.post('/', (req, res) => {
    let body = req.body;

    Usuario.findOne({email: body.email}, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas'
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas'
            });
        }

        // todo crear un token
        usuarioDB.password = "****";
        let token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400});

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token,
            id: usuarioDB.id
        });
    });
});


module.exports = app;