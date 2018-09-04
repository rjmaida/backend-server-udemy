const express = require('express');
const mdAuthentication = require('../middlewares/authentication');

const app = express();
const Medico = require('../models/medico');

/*
    Obtener todos los medicos
 */
app.get('/', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medico) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando los medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, total) => {
                    res.status(200).json({
                        ok: true,
                        total,
                        medico
                    });
                });

            }
        );

});

/*
    Actualizar medico
 */
app.put('/:id', mdAuthentication.verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(404).json({
                ok: false,
                mensaje: `El hospital con el ID ${id} no existe.`,
                errors: {message: 'No existe un medico con ese ID'}
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: medicoGuardado
            });
        });

    })
});

/*
    Crear nuevo medico
 */
app.post('/', mdAuthentication.verificaToken, (req, res) => {

    let body = req.body;
    let medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });

});

/*
    Borrar medico
 */
app.delete('/:id', mdAuthentication.verificaToken, (req, res) => {

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: {message: 'No existe un medico con ese id'}
            });
        }

        res.status(200).json({
            ok: true,
            hospital: medicoBorrado
        });

    });

});

module.exports = app;