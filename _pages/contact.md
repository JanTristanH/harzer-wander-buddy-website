---
layout: page
title: Kontakt
permalink: /contact
comments: false
---

<form action="https://formspree.io/{{site.formspreePath}}" method="POST">
<p class="mb-4">Sende deine Nachricht an das {{site.name}} Team. Wir antworten so schnell wie möglich!</p>
<div class="form-group row">
<div class="col-md-6">
<input class="form-control" type="text" aria-label="Name" name="name" placeholder="Name*" required>
</div>
<div class="col-md-6">
<input class="form-control" type="email" aria-label="E-Mail-Adresse" name="_replyto" placeholder="E-Mail-Adresse*" required>
</div>
</div>
<textarea rows="8" class="form-control mb-3" name="message" aria-label="Nachricht" placeholder="Nachricht*" required></textarea>
<p>Beim Absenden werden dein Name, deine E-Mail-Adresse und deine Nachricht an Formspree (USA) übermittelt und an uns weitergeleitet. Bitte sende keine Passwörter. Weitere Informationen findest du in der <a href="{{ '/privacy-policy' | relative_url }}">Datenschutzerklärung</a>. Alternativ erreichst du uns unter <a href="mailto:{{ site.email }}">{{ site.email }}</a>.</p>
<input class="btn btn-dark" type="submit" value="Senden">
</form>