const express = require("express");
const server = express();

server.use(express.json());

const projects = [
  {
    id: 1,
    title: "KScraper",
    tasks: ["Apply React to interface", "Include payment"]
  },
  {
    id: 2,
    title: "KPay",
    tasks: ["Get started"]
  }
];
//Crie um middleware que será utilizado em todas rotas que recebem o ID do projeto nos parâmetros da URL que verifica se o projeto com aquele ID existe. Se não existir retorne um erro, caso contrário permita a requisição continuar normalmente;
function projectExists(req, res, next) {
  const { id } = req.params;
  const project = findById(id);
  if (!project) {
    return res
      .status(404)
      .json({ error: `Project of id ${id} does not exist!` });
  }
  res.locals.project = project;
  return next();
}

function findById(id) {
  return id ? projects.find(idEquals(id)) : null;
}

function idEquals(id) {
  return p => p.id == id;
}

function bodyFieldsRequired(fields) {
  return (req, res, next) => {
    const missingFields = [];
    fields.forEach(field => {
      const value = req.body[field];
      if (!value) {
        missingFields.push(field);
      }
    });
    if (missingFields.length > 0) {
      const error =
        missingFields.length > 1
          ? `Fields ${missingFields.join(", ")} are required`
          : `Field ${missingFields} is required!`;
      return res.status(400).json({ error });
    }
    return next();
  };
}

//Crie um middleware global chamado em todas requisições que imprime (console.log) uma contagem de quantas requisições foram feitas na aplicação até então;
server.use((req, res, next) => {
  console.log(`\x1b[35m${req.method} - ${req.url}\x1b[0m`);
  return next();
});

server.get("/projects/:id", projectExists, (req, res) => {
  const { project } = res.locals;
  return res.json(project);
});

//POST /projects: A rota deve receber id e title dentro corpo de cadastrar um novo projeto dentro de um array no seguinte formato: { id: "1", title: 'Novo projeto', tasks: [] }; Certifique-se de enviar tanto o ID quanto o título do projeto no formato string com àspas duplas.
server.post("/projects", bodyFieldsRequired(["id", "title"]), (req, res) => {
  const { id, title } = req.body;
  if (findById(id)) {
    return res
      .status(409)
      .json({ error: `Project of id ${id} already exists!` });
  }
  const project = {
    id,
    title,
    tasks: []
  };
  projects.push(project);
  return res.json({
    message: "Project created successfully",
    link: `/projects/${id}`
  });
});
//GET /projects: Rota que lista todos projetos e suas tarefas;
server.get("/projects", (req, res) => {
  return res.json(projects);
});
//PUT /projects/:id: A rota deve alterar apenas o título do projeto com o id presente nos parâmetros da rota;
server.put(
  "/projects/:id",
  projectExists,
  bodyFieldsRequired(["title"]),
  (req, res) => {
    const { project } = res.locals;
    const { id } = project;
    const { title } = req.body;
    project.title = title;
    return res.json({
      message: `Project of id ${id} updated successfully!`,
      link: `/projects/${id}`
    });
  }
);
//DELETE /projects/:id: A rota deve deletar o projeto com o id presente nos parâmetros da rota;
server.delete("/projects/:id", projectExists, (req, res) => {
  const { id } = req.params;
  projects.splice(projects.findIndex(idEquals(id)), 1);
  return res.json({ message: `Project of id ${id} deleted successfully!` });
});
//POST /projects/:id/tasks: A rota deve receber um campo title e armazenar uma nova tarefa no array de tarefas de um projeto específico escolhido através do id presente nos parâmetros da rota;
server.post(
  "/projects/:id/tasks",
  projectExists,
  bodyFieldsRequired(["title"]),
  (req, res) => {
    const { project } = res.locals;
    const { id } = project;
    const { title } = req.body;
    project.tasks.push(title);
    return res.json({
      message: `Task added to project of id ${id} successfully!`,
      link: `/projects/${id}`
    });
  }
);

const PORT = 7777;
server.listen(PORT);
console.log(`\x1b[35mServer started at port: \x1b[36m${PORT}\x1b[0m`);
