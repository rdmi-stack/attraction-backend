import { Router } from 'express';
import { resolvePage, tenantSitemap } from '../controllers/page.controller';
import { optionalTenant, requireTenant } from '../middleware/tenant.middleware';

const router = Router();

router.get('/resolve', optionalTenant, resolvePage);
router.get('/sitemap.xml', optionalTenant, requireTenant, tenantSitemap);

export default router;
