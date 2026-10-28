import { f as lazyRouteComponent, p as createFileRoute } from "./_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_communityId-CanR2Tjp.js
var $$splitComponentImporter = () => import("./_communityId-CpIYVoKG.mjs");
var Route = createFileRoute("/community/$communityId")({
	head: ({ params }) => ({ meta: [{ title: `c/${params.communityId} — OctoCommunity` }, {
		name: "description",
		content: `Comunidade c/${params.communityId} no OctoCommunity`
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
