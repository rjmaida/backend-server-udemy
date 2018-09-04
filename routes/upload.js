const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const app = express();

const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    // Tipos de colecciones
    let tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleción no valida',
            errores: {mensaje: 'Los tipos de coleción validos son ' + tiposValidos.join(', ')}
        });
    }

    if (!req.files) {
        res.status(400).json({
            ok: false,
            mensaje: 'No selecciono ningun archivo',
            errores: {mensaje: 'Se debe seleccionar una imagen'}
        });
    }

    //Obtener nombre del archivo
    let archivo = req.files.imagen;
    let nombreCortado = archivo.name.split('.');
    let extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones validadas
    let extensionesValidadas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidadas.indexOf(extensionArchivo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errores: {mensaje: 'Las extensiones validas son ' + extensionesValidadas.join(', ')}
        });
    }

    // Nombre de archivo personalizado
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo del temporal a un path
    let path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errores: err
            });
        }
    });

    subirPorTipo(tipo, id, nombreArchivo, res)
});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        UpdateUserImage(id, res, nombreArchivo);
    }

    if (tipo === 'medicos') {

        updateMedicImage(id, res, nombreArchivo);
    }

    if (tipo === 'hospitales') {

        UpdateHospitalImage(id, res, nombreArchivo);
    }

}

function UpdateUserImage(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        let pathViejo = './uploads/usuarios/' + usuario.img;

        if (fs.existsSync(pathViejo)) {
            fs.unlinkSync(pathViejo);
        }

        usuario.img = nombreArchivo;

        usuario.save((err, usuarioActualizado) => {

            return res.status(200).json({
                ok: true,
                mensaje: 'Imagen actualizada',
                usuario: usuarioActualizado
            });

        })

    });
}

function updateMedicImage(id, res, nombreArchivo) {
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el medico',
                errors: err
            });
        }

        let pathViejo = './uploads/medicos/' + medico.img;

        if (fs.existsSync(pathViejo)) {
            fs.unlinkSync(pathViejo);
        }

        medico.img = nombreArchivo;

        medico.save((err, medicoActualizado) => {

            return res.status(200).json({
                ok: true,
                mensaje: 'Imagen actualizada',
                medico: medicoActualizado
            });

        })

    });
}

function UpdateHospitalImage(id, res, nombreArchivo) {
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital',
                errors: err
            });
        }

        let pathViejo = './uploads/hospitales/' + hospital.img;

        if (fs.existsSync(pathViejo)) {
            fs.unlinkSync(pathViejo);
        }

        hospital.img = nombreArchivo;

        hospital.save((err, hospitalActualizado) => {

            return res.status(200).json({
                ok: true,
                mensaje: 'Imagen actualizada',
                hospital: hospitalActualizado
            });

        })

    });
}

module.exports = app;