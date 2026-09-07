function projectCard(project) {
  const appLabel = project.actionLabel || "Apri applicazione";
  const appLink = project.app
    ? '<a class="button" href="' + project.app + '">' + appLabel + '</a>'
    : "";
  const downloadLink = project.download
    ? '<a class="button" href="' + project.download + '" download>Scarica per Windows</a>'
    : "";

  return '<article class="project-card">' +
    '<p class="project-meta">' + project.categoria + ' · ' + project.stato + '</p>' +
    '<h2>' + project.titolo + '</h2>' +
    '<p>' + project.descrizione + '</p>' +
    '<div class="project-links">' + appLink + downloadLink + '</div>' +
    '</article>';
}

async function renderProjects() {
  const response = await fetch("data/projects.json?v=20260907-2", { cache: "no-store" });
  if (!response.ok) throw new Error("Archivio dei progetti non disponibile");
  const projects = await response.json();

  const featured = document.querySelector("#featured-projects");
  const all = document.querySelector("#all-projects");
  if (featured) featured.innerHTML = projects.filter(p => p.featured).map(projectCard).join("");
  if (all) all.innerHTML = projects.map(projectCard).join("");
}

renderProjects().catch(error => {
  const target = document.querySelector("#featured-projects, #all-projects");
  if (target) target.innerHTML = '<p class="empty-state">' + error.message + '.</p>';
});
