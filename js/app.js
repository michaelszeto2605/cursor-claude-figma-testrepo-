import { currentUser, friends, places, timeSlots } from "./data.js";

const state = {
  filter: "all",
  query: "",
  selectedFriends: new Set(["priya", "tom", "jess"]),
  timeId: "fri-7",
  plan: {
    placeId: "shop-ramen",
    timeId: "fri-7",
    invited: ["priya", "tom", "jess", "ahmed"],
    rsvps: { priya: "in", tom: "in", jess: "maybe" },
  },
};

const $app = document.getElementById("app");

function navigate(path) {
  if (location.pathname + location.search !== path) {
    history.pushState({}, "", path);
  }
  render();
}

window.addEventListener("popstate", render);

function pathParts() {
  const path = location.pathname.replace(/\/$/, "") || "/";
  return path.split("/").filter(Boolean);
}

function placeById(id) {
  return places.find((p) => p.id === id) || places[0];
}

function timeById(id) {
  return timeSlots.find((t) => t.id === id) || timeSlots[0];
}

function icon(name, size) {
  return `<span class="nav-icon" style="width:${size}px;height:${size}px;flex-basis:${size}px"><img class="icon" src="/assets/${name}.svg" width="${size}" height="${size}" alt="" /></span>`;
}

function statusPill(status) {
  if (status === "been") return `<span class="pill pill-been">Been</span>`;
  return `<span class="pill pill-want">Want to try</span>`;
}

function friendsBeen(n) {
  return n ? `<span class="friends-been">${n} friends been</span>` : "";
}

function brand() {
  return `<div class="brand"><span class="logo-mark"></span><span>Food Places</span></div>`;
}

function nav(active) {
  const items = [
    ["places", "/", "icon-places", "Places"],
    ["plans", "/plans/shop-ramen", "icon-plans", "Plans"],
    ["friends", "/friends", "icon-friends", "Friends"],
  ];
  return items
    .map(
      ([key, href, ic, label]) => `
      <a class="nav-item ${active === key ? "is-active" : ""}" href="${href}" data-link>
        ${icon(ic, 20)}
        <span class="icon-rail-label">${label}</span>
      </a>`
    )
    .join("");
}

function sidebar(active) {
  return `
    <aside class="sidebar">
      ${brand()}
      <nav class="nav-list">${nav(active)}</nav>
      <div class="sidebar-footer">
        <span class="avatar">${currentUser.initial}</span>
        <span>${currentUser.name}</span>
      </div>
    </aside>
    <nav class="tabbar">
      <a href="/" data-link class="${active === "places" ? "is-active" : ""}">${icon("icon-places", 24)}Places</a>
      <a href="/plans/shop-ramen" data-link class="${active === "plans" ? "is-active" : ""}">${icon("icon-plans", 24)}Plans</a>
      <a href="/friends" data-link class="${active === "friends" ? "is-active" : ""}">${icon("icon-friends", 24)}Friends</a>
    </nav>
  `;
}

function shell(active, html) {
  return `
    <div class="app-shell">
      ${sidebar(active)}
      <main class="content"><div class="content-inner">${html}</div></main>
    </div>
  `;
}

function renderLibrary() {
  const q = state.query.toLowerCase();
  const list = places.filter((p) => {
    const matchesQ = !q || `${p.name} ${p.cuisine} ${p.suburb}`.toLowerCase().includes(q);
    const matchesF =
      state.filter === "all" ||
      (state.filter === "want" && p.status === "want") ||
      (state.filter === "been" && p.status === "been") ||
      (state.filter === "near" && ["Fitzroy", "Carlton"].includes(p.suburb));
    return matchesQ && matchesF;
  });

  const chips = [
    ["all", "All"],
    ["want", "Want to try"],
    ["been", "Been"],
    ["near", "Near me"],
  ];

  return shell(
    "places",
    `
    <div class="page-head">
      <h1>Your places</h1>
      <button class="btn btn-primary hide-mobile-cta" type="button">+ Add a place</button>
    </div>

    <label class="search">
      <img class="search-icon icon" src="/assets/icon-search.svg" width="18" height="18" alt="" />
      <input id="search" placeholder="Search your places" value="${state.query}" />
    </label>
    <div class="filters">
      ${chips
        .map(
          ([id, label]) =>
            `<button class="chip ${state.filter === id ? "is-active" : ""}" data-filter="${id}">${label}</button>`
        )
        .join("")}
    </div>

      <div class="welcome-back">
          <h3>See your list of saved places to invite friends to!</h3>
      </div>

    <div class="place-grid">
      ${list
        .map(
          (p) => `
        <a class="place-card" href="/places/${p.id}" data-link>
          <span class="ph"><img src="${p.image}" alt="" /></span>
          <span class="place-card-body">
            <h3>${p.name}</h3>
            <div class="meta">${p.cuisine} · ${p.suburb} · ${p.price}</div>
            <div class="tags">${statusPill(p.status)} ${friendsBeen(p.friendsBeen)}</div>
          </span>
        </a>`
        )
        .join("")}
    </div>
    <div class="sticky-cta"><button class="btn btn-primary btn-block" type="button">+ Add a place</button></div>
    `
  );
}

function renderDetail(id) {
  const p = placeById(id);
  return shell(
    "places",
    `
    <a class="back" href="/" data-link>
      <img class="chev icon" src="/assets/icon-back.svg" width="16" height="16" alt="" /> Your places
    </a>
    <div class="two-col">
      <div>
        <div class="detail-hero"><span class="ph"><img src="${p.image}" alt="${p.name}" /></span></div>
        <h2 style="margin-top:20px">${p.name}</h2>
        <div class="meta">${p.cuisine} · ${p.suburb} · ${p.price} · ${p.hours}</div>
        <div class="tags">${statusPill(p.status)} ${friendsBeen(p.friendsBeen)}</div>
        <div class="note">
          <div class="note-label">WHY YOU SAVED IT</div>
          ${p.note}
        </div>
      </div>
      <div class="action-panel">
        <a class="btn btn-primary btn-block hide-mobile-cta" href="/places/${p.id}/invite" data-link>Invite friends here</a>
        <a class="btn btn-secondary btn-block" href="https://maps.google.com/?q=${encodeURIComponent(p.address)}" target="_blank" rel="noreferrer">Open in Maps</a>
        <div class="info-row">
          <img class="info-icon icon" src="/assets/icon-pin.svg" width="18" height="18" alt="" />
          <div><div class="k">Address</div>${p.address}</div>
        </div>
        <div class="info-row">
          <img class="info-icon icon" src="/assets/icon-friends.svg" width="18" height="18" alt="" />
          <div><div class="k">Friends who want to go</div>${p.friendsWant.length ? p.friendsWant.join(", ") : "None yet"}</div>
        </div>
      </div>
    </div>
    <div class="sticky-cta"><a class="btn btn-primary btn-block" href="/places/${p.id}/invite" data-link>Invite friends here</a></div>
    `
  );
}

function smsCopy(place) {
  const time = timeById(state.timeId);
  const n = state.selectedFriends.size;
  return `Michael wants to get ${place.cuisine.toLowerCase()} at ${place.name}, ${time.label.replace(" · ", " ")}. You in? Tap to reply: foodplaces.app/r/4Lx2x`;
}

function renderInvite(id) {
  const p = placeById(id);
  const n = state.selectedFriends.size;
  return shell(
    "places",
    `
    <a class="back" href="/places/${p.id}" data-link>
      <img class="chev icon" src="/assets/icon-back.svg" width="16" height="16" alt="" /> ${p.name}
    </a>
    <h1>Invite friends to ${p.name}</h1>
    <div class="who-head"><span>WHEN</span></div>
    <div class="when-row">
      ${timeSlots
        .map(
          (t) =>
            `<button class="chip ${state.timeId === t.id ? "is-active" : ""}" data-time="${t.id}">${t.label}</button>`
        )
        .join("")}
      <button class="chip" type="button">Pick a time…</button>
    </div>
    <div class="two-col">
      <div>
        <div class="who-head">
          <span>WHO · ${n} SELECTED</span>
          <button class="btn-link" data-select-all>Select all</button>
        </div>
        ${friends
          .map((f) => {
            const on = state.selectedFriends.has(f.id);
            return `<button class="friend-row" data-friend="${f.id}">
              <span class="avatar">${f.initial}</span>
              <span class="grow"><span class="name">${f.name}</span><div class="phone">${f.phone}</div></span>
              <span class="check ${on ? "is-on" : ""}"></span>
            </button>`;
          })
          .join("")}
      </div>
      <div class="sms">
        <div class="note-label">TEXT THEY’LL GET</div>
        <p>${smsCopy(p)}</p>
        <button class="btn-link" type="button">Edit message</button>
        <div style="height:16px"></div>
        <button class="btn btn-primary btn-block" data-send ${n ? "" : "disabled"}>Send invite to ${n} friend${n === 1 ? "" : "s"}</button>
      </div>
    </div>
    <div class="sticky-cta"><button class="btn btn-primary btn-block" data-send>Send invite to ${n} friends</button></div>
    `
  );
}

function renderSent() {
  const p = placeById(state.plan.placeId);
  const time = timeById(state.plan.timeId);
  const names = [...state.selectedFriends]
    .map((id) => friends.find((f) => f.id === id)?.name.split(" ")[0])
    .filter(Boolean);
  const pretty =
    names.length <= 1
      ? names[0] || "Your friends"
      : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

  return shell(
    "places",
    `
    <div class="center-stage">
      <div class="sent-card">
        <div class="check-circle">✓</div>
        <h1>Invite sent</h1>
        <p class="sub">${pretty} just got a text. We’ll tell you as they reply — no need to chase anyone.</p>
        <div class="plan-box">
          <div class="note-label">THE PLAN</div>
          <div class="row"><span>Where</span><span>${p.name}, ${p.suburb}</span></div>
          <div class="row"><span>When</span><span>${time.when}</span></div>
          <div class="row"><span>Replies</span><span>0 of ${state.selectedFriends.size} so far</span></div>
        </div>
        <div class="sent-actions">
          <a class="btn btn-secondary" href="/" data-link>Back to your places</a>
          <a class="btn btn-primary" href="/plans/${p.id}" data-link>View plan</a>
        </div>
      </div>
    </div>
    `
  );
}

function renderRsvp() {
  const p = placeById(state.plan.placeId);
  const time = timeById(state.plan.timeId);
  return `
    <div class="rsvp-page">
      <div class="rsvp-card">
        <div class="rsvp-brand"><span class="logo-mark"></span> Food Places</div>
        <div class="avatar lg" style="margin:0 auto">M</div>
        <h1>Michael invited you to ${p.name}</h1>
        <div class="rsvp-meta">
          <div><span>When</span> ${time.when}</div>
          <div><span>Where</span> ${p.name}, ${p.address}</div>
          <div><span>Note</span> “${p.note.split(".")[0]}.”</div>
        </div>
        <div class="who-head"><span>ARE YOU IN?</span></div>
        <div class="rsvp-actions">
          <button class="btn btn-green rsvp-choice" data-rsvp="in"><span class="copy">I’m in<span class="sub">We’ll let Michael know</span></span><img class="icon arrow" src="/assets/icon-arrow-white.svg" width="16" height="16" alt="" /></button>
          <button class="btn btn-outline rsvp-choice" data-rsvp="maybe"><span class="copy">Maybe<span class="sub">You can change this later</span></span><img class="icon arrow" src="/assets/icon-arrow.svg" width="16" height="16" alt="" /></button>
          <button class="btn btn-outline rsvp-choice" data-rsvp="out"><span class="copy">Can’t make it<span class="sub">No hard feelings</span></span><img class="icon arrow" src="/assets/icon-arrow.svg" width="16" height="16" alt="" /></button>
        </div>
        <div class="whos-in">
          <div class="note-label">WHO’S IN SO FAR</div>
          Priya and Tom are in · Jess hasn’t replied
        </div>
        <p class="fineprint">No account needed. Come back to this link any time to change your reply.</p>
      </div>
    </div>
  `;
}

function rsvpLabel(value) {
  if (value === "in") return `<span class="pill pill-in">✓ In</span>`;
  if (value === "maybe") return `<span class="pill pill-maybe">? Maybe</span>`;
  return `<span class="reply-meta">No reply yet</span> <button class="nudge" type="button">Nudge</button>`;
}

function renderPlan(id) {
  const p = placeById(id);
  const time = timeById(state.plan.timeId);
  const invited = state.plan.invited.map((fid) => friends.find((f) => f.id === fid)).filter(Boolean);
  const counts = { in: 0, maybe: 0, none: 0 };
  invited.forEach((f) => {
    const v = state.plan.rsvps[f.id];
    if (v === "in") counts.in += 1;
    else if (v === "maybe") counts.maybe += 1;
    else counts.none += 1;
  });
  const replied = invited.filter((f) => state.plan.rsvps[f.id]).length;
  const noReply = counts.none;

  return shell(
    "plans",
    `
    <a class="back" href="/" data-link>
      <img class="chev icon" src="/assets/icon-back.svg" width="16" height="16" alt="" /> Your places
    </a>
    <div class="two-col">
      <div class="status-summary">
        <h2>${p.name}</h2>
        <div class="meta">${time.when} · ${p.address}</div>
        <div class="status-pills">
          <span class="in">${counts.in} in</span>
          <span class="maybe">${counts.maybe} maybe</span>
          <span class="none">${counts.none} no reply</span>
        </div>
        <a class="btn btn-primary btn-block" href="/places/${p.id}/invite" data-link>Send reminder to ${noReply} friend${noReply === 1 ? "" : "s"}</a>
        <div style="height:10px"></div>
        <button class="btn btn-secondary btn-block" type="button">Change time or place</button>
      </div>
      <div class="replies">
        <div class="page-head" style="margin:12px 0 4px">
          <div class="who-head" style="margin:0;width:100%">
            <span>REPLIES · ${replied} of ${invited.length}</span>
            <a class="btn-link" href="/places/${p.id}/invite" data-link>+ Invite more friends</a>
          </div>
        </div>
        ${invited
          .map((f) => {
            const v = state.plan.rsvps[f.id];
            return `<div class="friend-row">
              <span class="avatar">${f.initial}</span>
              <span class="grow"><span class="name">${f.name}</span></span>
              ${rsvpLabel(v)}
            </div>`;
          })
          .join("")}
      </div>
    </div>
    `
  );
}

function renderFriends() {
  return shell(
    "friends",
    `
    <div class="page-head"><h1>Friends</h1></div>
    ${friends
      .map(
        (f) => `
      <div class="friend-row">
        <span class="avatar">${f.initial}</span>
        <span class="grow"><span class="name">${f.name}</span><div class="phone">${f.phone}</div></span>
      </div>`
      )
      .join("")}
    `
  );
}

function bind() {
  $app.querySelectorAll("[data-link]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (el.target === "_blank") return;
      e.preventDefault();
      navigate(el.getAttribute("href"));
    });
  });

  const search = $app.querySelector("#search");
  if (search) {
    search.addEventListener("input", (e) => {
      state.query = e.target.value;
      const active = document.activeElement === search;
      render();
      if (active) {
        const next = document.querySelector("#search");
        next?.focus();
        next.selectionStart = next.selectionEnd = next.value.length;
      }
    });
  }

  $app.querySelectorAll("[data-filter]").forEach((el) => {
    el.addEventListener("click", () => {
      state.filter = el.dataset.filter;
      render();
    });
  });

  $app.querySelectorAll("[data-time]").forEach((el) => {
    el.addEventListener("click", () => {
      state.timeId = el.dataset.time;
      render();
    });
  });

  $app.querySelectorAll("[data-friend]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.dataset.friend;
      if (state.selectedFriends.has(id)) state.selectedFriends.delete(id);
      else state.selectedFriends.add(id);
      render();
    });
  });

  const selectAll = $app.querySelector("[data-select-all]");
  if (selectAll) {
    selectAll.addEventListener("click", () => {
      if (state.selectedFriends.size === friends.length) state.selectedFriends.clear();
      else friends.forEach((f) => state.selectedFriends.add(f.id));
      render();
    });
  }

  $app.querySelectorAll("[data-send]").forEach((el) => {
    el.addEventListener("click", () => {
      state.plan = {
        placeId: pathParts()[1] || "shop-ramen",
        timeId: state.timeId,
        invited: [...state.selectedFriends],
        rsvps: { priya: "in", tom: "in", jess: "maybe" },
      };
      navigate("/invite-sent");
    });
  });

  $app.querySelectorAll("[data-rsvp]").forEach((el) => {
    el.addEventListener("click", () => {
      navigate("/plans/shop-ramen");
    });
  });
}

function render() {
  const parts = pathParts();
  let html;
  if (parts[0] === "places" && parts[2] === "invite") html = renderInvite(parts[1]);
  else if (parts[0] === "places") html = renderDetail(parts[1]);
  else if (parts[0] === "invite-sent") html = renderSent();
  else if (parts[0] === "rsvp") html = renderRsvp();
  else if (parts[0] === "plans") html = renderPlan(parts[1]);
  else if (parts[0] === "friends") html = renderFriends();
  else html = renderLibrary();
  $app.innerHTML = html;
  bind();
}

render();
