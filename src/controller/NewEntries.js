import db from "../config/database.js";
import { entrieSchema } from "../model/EntrieSchema.js";


export async function listEntries(req, res) {

    try {
      const entrieData = await db.collection("entries").find().toArray()
        
      console.log(entrieData)
  
      return res.send(entrieData)
    } catch (error) {
      res.status(500).send(error.message)
    }
  }

export async function addEntrie(req, res){
    const entrie = req.body;
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", '')
    if (!token) return res.status(422).send("Informe o token!")
    const {value, description} = req.body
    
    const validation = entrieSchema.validate(entrie, { pick: ["value", "description"], abortEarly: false })
    
    if(validation.error){
        const errors = validation.error.details.map((err) => {
            return err.message
          })
          return res.status(422).send(errors)
    }

    try {
        const checkSession = await db.collection("sessoes").findOne({ token })

        if (!checkSession) return res.status(401).send("Usuário não está logado. Faça o login e tente novamente.")

        console.log(token,value,description)
        await db.collection("entries").insertOne({ user: token, value: value, description: description  })
        res.sendStatus(200)
        
      } catch (error) {
        res.status(500).send(error.message)
      }
}

