<script lang="ts">
	const siteName = 'Calcul Prêt';
	const siteUrl = 'https://www.calcul-pret.com';
	const pageTitle = 'Mentions Légales | Calcul-pret.com';
	const pageDescription =
		"Mentions légales du site Calcul-pret.com, outil gratuit de simulation de prêt immobilier et de calcul de capacité d'emprunt.";
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<link rel="canonical" href={`${siteUrl}/mentions-legales`} />
	<meta name="description" content={pageDescription} />
	<meta name="robots" content="index, follow" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content={`${siteUrl}/mentions-legales`} />
	<meta property="og:locale" content="fr_FR" />
</svelte:head>

<div class="page-wrapper">
	<nav class="nav-bar">
		<a href="/" class="nav-link">← Retour à l'accueil</a>
	</nav>

	<div class="legal-container">
		<h1>📋 Mentions Légales</h1>

		<section class="legal-section">
			<h2>1. Éditeur du site</h2>
			<p>
				Le site <strong>Calcul-pret.com</strong> est édité par :
			</p>
			<ul>
				<li><strong>Nom :</strong> William Groc</li>
				<li><strong>Statut :</strong> Particulier</li>
				<li><strong>Email :</strong> william.groc@gmail.com</li>
			</ul>
		</section>

		<section class="legal-section">
			<h2>2. Hébergement</h2>
			<p>Le site est hébergé par :</p>
			<ul>
				<li><strong>Hébergeur :</strong> Railway</li>
				<li><strong>Adresse :</strong> 548 Market St PMB 68956, San Francisco, California 94104</li>
			</ul>
		</section>

		<section class="legal-section">
			<h2>3. Objet du site</h2>
			<p>
				Calcul-pret.com est un outil gratuit de simulation de prêt immobilier permettant aux
				utilisateurs de :
			</p>
			<ul>
				<li>Calculer leurs mensualités de prêt</li>
				<li>Estimer leur capacité d'emprunt maximale</li>
				<li>Évaluer le prix maximum d'un bien immobilier qu'ils peuvent acquérir</li>
				<li>Calculer les frais annexes (notaire, dossier, garantie, assurance)</li>
				<li>Déterminer leur taux d'endettement</li>
			</ul>
		</section>

		<section class="legal-section">
			<h2>4. Limitation de responsabilité</h2>
			<p>
				<strong>Les informations fournies sur ce site sont à titre indicatif uniquement.</strong>
			</p>
			<p>
				Les calculs et simulations présentés ne constituent pas des offres de prêt et n'engagent
				aucunement l'éditeur du site. Les résultats obtenus sont des estimations basées sur les
				paramètres saisis par l'utilisateur.
			</p>
			<p>
				Les taux d'intérêt, les frais bancaires, les conditions d'octroi de prêt et les modalités de
				calcul peuvent varier selon les établissements financiers. Il est fortement recommandé de
				consulter un conseiller bancaire ou un courtier en prêt immobilier pour obtenir une offre
				personnalisée et des conseils adaptés à votre situation.
			</p>
			<p>
				L'éditeur ne peut être tenu responsable des décisions prises sur la base des informations
				fournies par le site.
			</p>
		</section>

		<section class="legal-section">
			<h2>5. Propriété intellectuelle</h2>
			<p>
				L'ensemble du contenu de ce site (structure, textes, graphismes, logos, icônes) est la
				propriété exclusive de William Groc, sauf mention contraire.
			</p>
			<p>
				Toute reproduction, distribution, modification, adaptation, retransmission ou publication de
				ces différents éléments est strictement interdite sans l'accord exprès par écrit de
				l'éditeur.
			</p>
		</section>

		<section class="legal-section">
			<h2>6. Protection des données personnelles (RGPD)</h2>
			<p>
				<strong>Calcul-pret.com respecte votre vie privée.</strong>
			</p>
			<p>Les données que vous saisissez dans les calculateurs :</p>
			<ul>
				<li>
					<strong>Sont stockées localement</strong> dans votre navigateur (localStorage) uniquement
				</li>
				<li><strong>Ne sont pas transmises</strong> à nos serveurs</li>
				<li><strong>Ne sont pas collectées</strong> ni analysées par l'éditeur du site</li>
				<li>
					<strong>Restent sous votre contrôle</strong> - vous pouvez les supprimer à tout moment
				</li>
			</ul>
			<p>
				Aucune donnée personnelle n'est collectée via des formulaires de contact ou d'inscription,
				car le site ne propose pas de telles fonctionnalités.
			</p>
			<p>
				Le site n'utilise pas de cookies de suivi ou d'analyse. Seuls les cookies techniques
				nécessaires au fonctionnement du site (localStorage) sont utilisés.
			</p>
		</section>

		<section class="legal-section">
			<h2>7. Liens hypertextes</h2>
			<p>
				Le site peut contenir des liens vers d'autres sites internet. L'éditeur n'exerce aucun
				contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
			</p>
		</section>

		<section class="legal-section">
			<h2>8. Modifications</h2>
			<p>
				L'éditeur se réserve le droit de modifier les présentes mentions légales à tout moment. Les
				utilisateurs sont invités à les consulter régulièrement.
			</p>
		</section>

		<section class="legal-section">
			<h2>9. Droit applicable</h2>
			<p>
				Les présentes mentions légales sont régies par le droit français. En cas de litige et à
				défaut d'accord amiable, le litige sera porté devant les tribunaux français compétents.
			</p>
		</section>

		<section class="legal-section">
			<h2>10. Contact</h2>
			<p>
				Pour toute question concernant ces mentions légales ou le fonctionnement du site, vous
				pouvez nous contacter à l'adresse :
			</p>
			<p class="contact-email">
				<strong>📧 william.groc@gmail.com</strong>
			</p>
		</section>

		<div class="last-update">
			<p><em>Dernière mise à jour : 8 janvier 2026</em></p>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
	}

	.page-wrapper {
		min-height: 100vh;
		padding-bottom: 3rem;
	}

	.nav-bar {
		padding: 1.5rem 2rem;
	}

	.nav-link {
		background: white;
		color: #667eea;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.2s;
		display: inline-block;
	}

	.nav-link:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.legal-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	h1 {
		color: #333;
		font-size: 2.5rem;
		margin: 0 0 2rem 0;
		text-align: center;
		padding-bottom: 1rem;
		border-bottom: 3px solid #667eea;
	}

	.legal-section {
		margin-bottom: 2.5rem;
	}

	h2 {
		color: #667eea;
		font-size: 1.5rem;
		margin: 0 0 1rem 0;
	}

	p {
		color: #444;
		line-height: 1.8;
		margin: 0 0 1rem 0;
		text-align: justify;
	}

	ul {
		color: #444;
		line-height: 1.8;
		margin: 1rem 0;
		padding-left: 2rem;
	}

	li {
		margin-bottom: 0.5rem;
	}

	strong {
		color: #333;
		font-weight: 600;
	}

	.contact-email {
		text-align: center;
		font-size: 1.2rem;
		padding: 1rem;
		background: #f0f4ff;
		border-radius: 8px;
		margin-top: 1rem;
	}

	.last-update {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid #e0e0e0;
		text-align: center;
	}

	.last-update p {
		color: #999;
		font-size: 0.9rem;
		text-align: center;
	}

	@media (max-width: 768px) {
		.legal-container {
			padding: 1.5rem;
			margin: 0 1rem;
		}

		h1 {
			font-size: 2rem;
		}

		h2 {
			font-size: 1.3rem;
		}

		p,
		ul {
			text-align: left;
		}

		.nav-bar {
			padding: 1rem;
		}
	}
</style>
