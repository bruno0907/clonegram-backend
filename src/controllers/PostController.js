const Post = require('../models/Post')

const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

module.exports = {

    async index(req, res) {
        const posts = await Post.find().sort('-createdAt') // -createdAt retorna a ordenação por descrescente.

        return res.json(posts)
    },

    async store(req, res) {
        const {author, place, description, hashtags} = req.body
        const {filename: image} = req.file

        const [name] = image.split('.')
        const fileName = `${name}.jpg`

        // Sharp é a dependência responsável por manipular a imagem
        await sharp(req.file.path) // Buscando no req.file
            .resize(500) // definindo o tamanho em px
            .jpeg({quality: 70}) // qualidade em %
            .toFile(
                path.resolve(req.file.destination, 'resized', fileName) 
                /* pegando do req.file o destino de armazenamento e jogando pra pasta 
                indicada no segundo parâmetro e o nomeando no terceiro parâmetro 
                o nome ta vindo ali da constante declarada acima renomeando o filename do req.file */
            )
        
        fs.unlinkSync(req.file.path) // método para excluir o arquivo de fora da pasta resized via fs

        const post = await Post.create({
            author, 
            place,
            description,
            hashtags,
            image: fileName,
        })

        req.io.emit('post', post)

        return res.json({post})
    }

}