// Configuración inicial
const width = document.getElementById("chart").clientWidth;
const height = document.getElementById("chart").clientHeight;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

let data = {
  nodes: [
    { id: "Matemáticas", group: 1 },
    { id: "Álgebra", group: 1 },
    { id: "Geometría", group: 1 },
    { id: "Cálculo", group: 1 },
    { id: "Ciencias Naturales", group: 2 },
    { id: "Biología", group: 2 },
    { id: "Física", group: 2 },
    { id: "Química", group: 2 },
    { id: "Tecnología", group: 3 },
    { id: "Programación", group: 3 },
    { id: "Desarrollo Web", group: 3 },
    { id: "Inteligencia Artificial", group: 3 }
  ],
  links: [
    { source: "Matemáticas", target: "Álgebra" },
    { source: "Matemáticas", target: "Geometría" },
    { source: "Matemáticas", target: "Cálculo" },
    { source: "Ciencias Naturales", target: "Biología" },
    { source: "Ciencias Naturales", target: "Física" },
    { source: "Ciencias Naturales", target: "Química" },
    { source: "Tecnología", target: "Programación" },
    { source: "Tecnología", target: "Desarrollo Web" },
    { source: "Tecnología", target: "Inteligencia Artificial" }
  ]
};

let selectedNodes = [];

// Simulación de fuerza
const simulation = d3.forceSimulation(data.nodes)
  .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
  .force("charge", d3.forceManyBody().strength(-400))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collision", d3.forceCollide(50));

// Elementos visuales
let link = svg.append("g")
  .attr("class", "links")
  .selectAll("line")
  .data(data.links)
  .enter().append("line")
  .attr("stroke-width", 2)
  .style("stroke", "#aaa");

let node = svg.append("g")
  .attr("class", "nodes")
  .selectAll("circle")
  .data(data.nodes)
  .enter().append("circle")
  .attr("r", 10)
  .attr("fill", d => d3.schemeTableau10[d.group % 10])
  .on("click", selectNode)
  .call(d3.drag()
    .on("start", dragStarted)
    .on("drag", dragged)
    .on("end", dragEnded));

let label = svg.append("g")
  .attr("class", "labels")
  .selectAll("text")
  .data(data.nodes)
  .enter().append("text")
  .attr("dy", -15)
  .attr("text-anchor", "middle")
  .style("font-size", "12px")
  .text(d => d.id);

// Funciones de interacción
function selectNode(event, d) {
  if (selectedNodes.includes(d)) {
    selectedNodes = selectedNodes.filter(node => node !== d);
    d3.select(event.target).attr("stroke", null);
  } else {
    selectedNodes.push(d);
    d3.select(event.target).attr("stroke", "black").attr("stroke-width", 2);
  }
}

function dragStarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragEnded(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

// Crear nuevo nodo al combinar nodos seleccionados
document.getElementById("combineBtn").addEventListener("click", combineNodes);

function combineNodes() {
  if (selectedNodes.length < 2) {
    alert("Selecciona al menos dos nodos para combinarlos.");
    return;
  }

  const newId = `Especialización en ${selectedNodes.map(n => n.id).join(", ")}`;
  const combinedNode = { id: newId, group: 7 };
  data.nodes.push(combinedNode);

  selectedNodes.forEach(node => {
    data.links.push({ source: combinedNode.id, target: node.id });
  });

  selectedNodes = [];
  d3.selectAll("circle").attr("stroke", null);
  restart();
}

function restart() {
  node = node.data(data.nodes, d => d.id);
  node.exit().remove();
  node = node.enter()
    .append("circle")
    .attr("r", 10)
    .attr("fill", d => d3.schemeTableau10[d.group % 10])
    .on("click", selectNode)
    .call(d3.drag()
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded))
    .merge(node);

  link = link.data(data.links, d => `${d.source.id}-${d.target.id}`);
  link.exit().remove();
  link = link.enter()
    .append("line")
    .attr("stroke-width", 2)
    .style("stroke", "#aaa")
    .merge(link);

  label = label.data(data.nodes, d => d.id);
  label.exit().remove();
  label = label.enter()
    .append("text")
    .attr("dy", -15)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text(d => d.id)
    .merge(label);

  simulation.nodes(data.nodes);
  simulation.force("link").links(data.links);
  simulation.alpha(1).restart();
}

simulation.on("tick", () => {
  link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

  node
    .attr("cx", d => d.x = Math.max(10, Math.min(width - 10, d.x)))
    .attr("cy", d => d.y = Math.max(10, Math.min(height - 10, d.y)));

  label
    .attr("x", d => d.x)
    .attr("y", d => d.y);
});
