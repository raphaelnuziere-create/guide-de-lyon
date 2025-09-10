#!/usr/bin/env node

/**
 * GUIDE DE LYON - AUDIT TECHNIQUE EXHAUSTIF
 * ==========================================
 * 
 * Ce script effectue un audit technique complet pour identifier :
 * - Architecture et organisation du code
 * - Problèmes techniques et incohérences
 * - Dead code et imports cassés
 * - Workflow utilisateurs cassés
 * - Performance et sécurité
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TechnicalAuditor {
    constructor() {
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        this.auditResults = {
            timestamp: this.timestamp,
            startTime: Date.now(),
            architecture: {},
            codeIssues: [],
            workflows: {},
            performance: {},
            security: {},
            recommendations: [],
            summary: {}
        };
        
        console.log(`🔍 DÉMARRAGE AUDIT TECHNIQUE EXHAUSTIF - ${this.timestamp}`);
    }

    analyzeProjectStructure() {
        console.log('\n📁 ANALYSE STRUCTURE PROJET...');
        
        try {
            // Analyser l'arborescence
            const structure = {
                rootFiles: this.getFilesList('.', 1),
                appPages: this.getFilesList('app', 2),
                components: this.getFilesList('components', 2),
                libFiles: this.getFilesList('lib', 2),
                supabaseFiles: this.getFilesList('supabase', 2),
                scriptsCount: this.getFilesList('scripts', 1).length,
                duplicateVersions: this.findDuplicateVersions()
            };

            // Analyser package.json
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            structure.dependencies = {
                total: Object.keys(packageJson.dependencies || {}).length,
                devDependencies: Object.keys(packageJson.devDependencies || {}).length,
                scripts: Object.keys(packageJson.scripts || {}).length
            };

            // Détecter les frameworks utilisés
            structure.frameworks = this.detectFrameworks(packageJson);
            
            // Identifier les systèmes d'auth multiples
            structure.authSystems = this.detectAuthSystems();

            this.auditResults.architecture = structure;
            
            console.log(`✅ Structure analysée: ${structure.appPages.length} pages, ${structure.components.length} composants`);
            
        } catch (error) {
            console.error(`❌ Erreur analyse structure: ${error.message}`);
        }
    }

    detectAuthSystems() {
        const authFiles = [
            'lib/auth/firebase-auth.ts',
            'lib/auth/simple-auth.ts', 
            'lib/auth/admin-auth.ts',
            'lib/auth/supabase-auth.ts',
            'lib/auth/supabase-auth-enhanced.ts'
        ];

        return authFiles.filter(file => fs.existsSync(file)).map(file => ({
            file,
            exists: true,
            size: fs.statSync(file).size
        }));
    }

    detectFrameworks(packageJson) {
        const frameworks = [];
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        if (deps.next) frameworks.push(`Next.js ${deps.next}`);
        if (deps.react) frameworks.push(`React ${deps.react}`);
        if (deps['@supabase/supabase-js']) frameworks.push(`Supabase ${deps['@supabase/supabase-js']}`);
        if (deps.firebase) frameworks.push(`Firebase ${deps.firebase}`);
        if (deps.stripe) frameworks.push(`Stripe ${deps.stripe}`);
        if (deps.tailwindcss) frameworks.push(`Tailwind ${deps.tailwindcss}`);
        
        return frameworks;
    }

    findDuplicateVersions() {
        const guideLyonDirs = fs.readdirSync('.')
            .filter(name => name.startsWith('guide-lyon-v') && fs.statSync(name).isDirectory());
        
        return guideLyonDirs.map(dir => ({
            name: dir,
            size: this.getDirectorySize(dir),
            lastModified: fs.statSync(dir).mtime
        }));
    }

    getDirectorySize(dirPath) {
        let totalSize = 0;
        try {
            const files = fs.readdirSync(dirPath, { withFileTypes: true });
            for (const file of files) {
                const fullPath = path.join(dirPath, file.name);
                if (file.isFile()) {
                    totalSize += fs.statSync(fullPath).size;
                } else if (file.isDirectory() && !file.name.includes('node_modules')) {
                    totalSize += this.getDirectorySize(fullPath);
                }
            }
        } catch (error) {
            // Ignorer erreurs permission
        }
        return totalSize;
    }

    getFilesList(dirPath, maxDepth, currentDepth = 0) {
        const files = [];
        
        try {
            if (!fs.existsSync(dirPath) || currentDepth >= maxDepth) return files;
            
            const items = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item.name);
                
                if (item.isFile()) {
                    files.push({
                        name: item.name,
                        path: fullPath,
                        size: fs.statSync(fullPath).size,
                        extension: path.extname(item.name)
                    });
                } else if (item.isDirectory() && currentDepth < maxDepth - 1) {
                    files.push(...this.getFilesList(fullPath, maxDepth, currentDepth + 1));
                }
            }
        } catch (error) {
            // Ignorer erreurs permission
        }
        
        return files;
    }

    analyzeCodeIssues() {
        console.log('\n🔍 ANALYSE PROBLÈMES CODE...');
        
        try {
            const issues = [];

            // Rechercher imports cassés
            issues.push(...this.findBrokenImports());
            
            // Rechercher variables undefined
            issues.push(...this.findUndefinedVariables());
            
            // Rechercher dead code
            issues.push(...this.findDeadCode());
            
            // Rechercher console.log
            issues.push(...this.findDebugCode());
            
            // Rechercher TODO/FIXME
            issues.push(...this.findTodoComments());

            // Rechercher duplications
            issues.push(...this.findDuplicateCode());

            this.auditResults.codeIssues = issues;
            
            console.log(`✅ ${issues.length} problèmes de code identifiés`);
            
        } catch (error) {
            console.error(`❌ Erreur analyse code: ${error.message}`);
        }
    }

    findBrokenImports() {
        const issues = [];
        const tsFiles = this.findFilesByExtension(['.ts', '.tsx'], ['app', 'components', 'lib']);
        
        tsFiles.forEach(file => {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
                
                importLines.forEach((line, index) => {
                    const match = line.match(/from ['"]([^'"]+)['"]/);
                    if (match && match[1] && !match[1].startsWith('@') && !match[1].startsWith('next')) {
                        const importPath = this.resolveImportPath(file, match[1]);
                        if (importPath && !fs.existsSync(importPath)) {
                            issues.push({
                                type: 'BROKEN_IMPORT',
                                file: file,
                                line: index + 1,
                                issue: `Import cassé: ${match[1]}`,
                                severity: 'HIGH'
                            });
                        }
                    }
                });
            } catch (error) {
                // Ignorer erreurs lecture fichier
            }
        });
        
        return issues;
    }

    resolveImportPath(fromFile, importPath) {
        const dir = path.dirname(fromFile);
        
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
            let resolved = path.resolve(dir, importPath);
            
            // Essayer avec extensions
            const extensions = ['.ts', '.tsx', '.js', '.jsx'];
            for (const ext of extensions) {
                if (fs.existsSync(resolved + ext)) return resolved + ext;
            }
            
            // Essayer avec index
            for (const ext of extensions) {
                if (fs.existsSync(path.join(resolved, 'index' + ext))) {
                    return path.join(resolved, 'index' + ext);
                }
            }
            
            return resolved;
        }
        
        return null;
    }

    findUndefinedVariables() {
        const issues = [];
        // Implémentation simplifiée - pourrait être étendue avec un parser AST
        return issues;
    }

    findDeadCode() {
        const issues = [];
        const tsFiles = this.findFilesByExtension(['.ts', '.tsx'], ['app', 'components', 'lib']);
        
        // Rechercher fonctions exportées mais non importées
        const exports = new Map();
        const imports = new Set();
        
        tsFiles.forEach(file => {
            try {
                const content = fs.readFileSync(file, 'utf8');
                
                // Capturer exports
                const exportMatches = content.match(/export\s+(function|const|class)\s+(\w+)/g);
                if (exportMatches) {
                    exportMatches.forEach(match => {
                        const name = match.match(/(\w+)$/)?.[1];
                        if (name) exports.set(name, file);
                    });
                }
                
                // Capturer imports
                const importMatches = content.match(/import\s*{([^}]+)}/g);
                if (importMatches) {
                    importMatches.forEach(match => {
                        const names = match.match(/{([^}]+)}/)?.[1]
                            .split(',')
                            .map(n => n.trim());
                        if (names) names.forEach(name => imports.add(name));
                    });
                }
            } catch (error) {
                // Ignorer erreurs lecture
            }
        });
        
        // Identifier exports non utilisés
        exports.forEach((file, name) => {
            if (!imports.has(name)) {
                issues.push({
                    type: 'UNUSED_EXPORT',
                    file: file,
                    issue: `Export non utilisé: ${name}`,
                    severity: 'MEDIUM'
                });
            }
        });
        
        return issues;
    }

    findDebugCode() {
        const issues = [];
        const sourceFiles = this.findFilesByExtension(['.ts', '.tsx', '.js', '.jsx'], ['app', 'components', 'lib']);
        
        sourceFiles.forEach(file => {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const lines = content.split('\n');
                
                lines.forEach((line, index) => {
                    if (line.includes('console.log') || line.includes('console.error') || line.includes('debugger')) {
                        issues.push({
                            type: 'DEBUG_CODE',
                            file: file,
                            line: index + 1,
                            issue: `Code debug: ${line.trim()}`,
                            severity: 'LOW'
                        });
                    }
                });
            } catch (error) {
                // Ignorer erreurs lecture
            }
        });
        
        return issues;
    }

    findTodoComments() {
        const issues = [];
        const sourceFiles = this.findFilesByExtension(['.ts', '.tsx', '.js', '.jsx'], ['app', 'components', 'lib']);
        
        sourceFiles.forEach(file => {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const lines = content.split('\n');
                
                lines.forEach((line, index) => {
                    const todoMatch = line.match(/(TODO|FIXME|HACK|XXX):\s*(.+)/i);
                    if (todoMatch) {
                        issues.push({
                            type: 'TODO_COMMENT',
                            file: file,
                            line: index + 1,
                            issue: `${todoMatch[1]}: ${todoMatch[2]}`,
                            severity: 'LOW'
                        });
                    }
                });
            } catch (error) {
                // Ignorer erreurs lecture
            }
        });
        
        return issues;
    }

    findDuplicateCode() {
        const issues = [];
        // Implémentation simplifiée - détection basique de fonctions similaires
        return issues;
    }

    findFilesByExtension(extensions, directories) {
        const files = [];
        
        directories.forEach(dir => {
            if (fs.existsSync(dir)) {
                files.push(...this.getFilesByExtensionRecursive(dir, extensions));
            }
        });
        
        return files;
    }

    getFilesByExtensionRecursive(dirPath, extensions) {
        const files = [];
        
        try {
            const items = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item.name);
                
                if (item.isFile() && extensions.includes(path.extname(item.name))) {
                    files.push(fullPath);
                } else if (item.isDirectory() && !item.name.includes('node_modules')) {
                    files.push(...this.getFilesByExtensionRecursive(fullPath, extensions));
                }
            }
        } catch (error) {
            // Ignorer erreurs permission
        }
        
        return files;
    }

    analyzeWorkflows() {
        console.log('\n🔄 ANALYSE WORKFLOWS UTILISATEURS...');
        
        try {
            const workflows = {
                authentication: this.analyzeAuthWorkflow(),
                subscription: this.analyzeSubscriptionWorkflow(),
                content: this.analyzeContentWorkflow(),
                admin: this.analyzeAdminWorkflow()
            };

            this.auditResults.workflows = workflows;
            
            const totalWorkflows = Object.keys(workflows).length;
            const functionalWorkflows = Object.values(workflows).filter(w => w.status === 'FUNCTIONAL').length;
            
            console.log(`✅ ${functionalWorkflows}/${totalWorkflows} workflows analysés`);
            
        } catch (error) {
            console.error(`❌ Erreur analyse workflows: ${error.message}`);
        }
    }

    analyzeAuthWorkflow() {
        const authFiles = [
            'app/pro/inscription/page.tsx',
            'app/connexion/page.tsx',
            'app/administration/connexion/page.tsx'
        ];
        
        const issues = [];
        const components = {};
        
        authFiles.forEach(file => {
            components[file] = {
                exists: fs.existsSync(file),
                hasForm: false,
                hasValidation: false
            };
            
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                components[file].hasForm = content.includes('<form') || content.includes('onSubmit');
                components[file].hasValidation = content.includes('validate') || content.includes('schema');
            } else {
                issues.push(`Fichier manquant: ${file}`);
            }
        });

        // Vérifier middleware auth
        const middlewareExists = fs.existsSync('middleware.ts');
        const middlewareBackupExists = fs.existsSync('middleware.ts.backup');
        
        if (!middlewareExists && middlewareBackupExists) {
            issues.push('Middleware auth manquant (backup trouvé)');
        }

        return {
            status: issues.length === 0 ? 'FUNCTIONAL' : 'ISSUES',
            components,
            issues,
            authSystems: this.auditResults.architecture.authSystems?.length || 0
        };
    }

    analyzeSubscriptionWorkflow() {
        const subscriptionFiles = [
            'app/pro/upgrade/page.tsx',
            'app/api/stripe/webhook/route.ts',
            'lib/stripe.ts'
        ];
        
        const issues = [];
        const components = {};
        
        subscriptionFiles.forEach(file => {
            components[file] = { exists: fs.existsSync(file) };
            if (!fs.existsSync(file)) {
                issues.push(`Fichier manquant: ${file}`);
            }
        });

        return {
            status: issues.length === 0 ? 'FUNCTIONAL' : 'ISSUES',
            components,
            issues
        };
    }

    analyzeContentWorkflow() {
        const contentFiles = [
            'app/pro/etablissement/edit/page.tsx',
            'app/pro/evenements/nouveau/page.tsx',
            'app/annuaire/page.tsx'
        ];
        
        const issues = [];
        const components = {};
        
        contentFiles.forEach(file => {
            components[file] = { exists: fs.existsSync(file) };
            if (!fs.existsSync(file)) {
                issues.push(`Fichier manquant: ${file}`);
            }
        });

        return {
            status: issues.length === 0 ? 'FUNCTIONAL' : 'ISSUES',
            components,
            issues
        };
    }

    analyzeAdminWorkflow() {
        const adminFiles = [
            'app/administration/dashboard/page.tsx',
            'app/administration/connexion/page.tsx'
        ];
        
        const issues = [];
        const components = {};
        
        adminFiles.forEach(file => {
            components[file] = { exists: fs.existsSync(file) };
            if (!fs.existsSync(file)) {
                issues.push(`Fichier manquant: ${file}`);
            }
        });

        return {
            status: issues.length === 0 ? 'FUNCTIONAL' : 'ISSUES',
            components,
            issues
        };
    }

    analyzePerformance() {
        console.log('\n⚡ ANALYSE PERFORMANCE...');
        
        try {
            const performance = {
                bundleSize: this.analyzeBundleSize(),
                imageOptimization: this.analyzeImageOptimization(),
                loadingStrategies: this.analyzeLoadingStrategies(),
                caching: this.analyzeCaching()
            };

            this.auditResults.performance = performance;
            console.log('✅ Analyse performance terminée');
            
        } catch (error) {
            console.error(`❌ Erreur analyse performance: ${error.message}`);
        }
    }

    analyzeBundleSize() {
        try {
            const nextBuildInfo = path.join('.next', 'build-manifest.json');
            if (fs.existsSync(nextBuildInfo)) {
                const buildInfo = JSON.parse(fs.readFileSync(nextBuildInfo, 'utf8'));
                return {
                    status: 'ANALYZED',
                    pages: Object.keys(buildInfo.pages || {}).length,
                    hasManifest: true
                };
            }
            return { status: 'NO_BUILD', hasManifest: false };
        } catch (error) {
            return { status: 'ERROR', error: error.message };
        }
    }

    analyzeImageOptimization() {
        const publicImages = this.findFilesByExtension(['.jpg', '.jpeg', '.png', '.webp'], ['public']);
        const unoptimizedImages = publicImages.filter(img => {
            const size = fs.statSync(img).size;
            return size > 500 * 1024; // Images > 500KB
        });

        return {
            totalImages: publicImages.length,
            unoptimizedCount: unoptimizedImages.length,
            unoptimizedImages: unoptimizedImages.slice(0, 10) // Limiter à 10
        };
    }

    analyzeLoadingStrategies() {
        const appFiles = this.findFilesByExtension(['.tsx'], ['app']);
        const hasLazyLoading = appFiles.some(file => {
            const content = fs.readFileSync(file, 'utf8');
            return content.includes('lazy') || content.includes('Suspense') || content.includes('dynamic');
        });

        return {
            hasLazyLoading,
            totalPages: appFiles.filter(f => f.includes('page.tsx')).length
        };
    }

    analyzeCaching() {
        const nextConfig = fs.existsSync('next.config.ts');
        const vercelConfig = fs.existsSync('vercel.json');
        
        return {
            hasNextConfig: nextConfig,
            hasVercelConfig: vercelConfig,
            hasCacheHeaders: false // À analyser plus en détail
        };
    }

    analyzeSecurity() {
        console.log('\n🔒 ANALYSE SÉCURITÉ...');
        
        try {
            const security = {
                authentication: this.analyzeAuthSecurity(),
                environment: this.analyzeEnvSecurity(),
                dependencies: this.analyzeDependencySecurity(),
                apiRoutes: this.analyzeApiSecurity()
            };

            this.auditResults.security = security;
            console.log('✅ Analyse sécurité terminée');
            
        } catch (error) {
            console.error(`❌ Erreur analyse sécurité: ${error.message}`);
        }
    }

    analyzeAuthSecurity() {
        const authFiles = this.auditResults.architecture.authSystems || [];
        const issues = [];
        
        // Multiples systèmes d'auth = risque
        if (authFiles.length > 2) {
            issues.push(`${authFiles.length} systèmes d'auth détectés (confusion possible)`);
        }
        
        // Vérifier middleware
        if (!fs.existsSync('middleware.ts')) {
            issues.push('Middleware de protection des routes manquant');
        }

        return {
            authSystemsCount: authFiles.length,
            issues,
            severity: issues.length > 0 ? 'MEDIUM' : 'LOW'
        };
    }

    analyzeEnvSecurity() {
        const issues = [];
        
        // Vérifier si .env.local est committé (ne devrait pas)
        if (fs.existsSync('.env.local')) {
            try {
                execSync('git ls-files .env.local', { stdio: 'pipe' });
                issues.push('.env.local est committé dans Git (DANGER)');
            } catch (error) {
                // Bon, pas committé
            }
        }
        
        // Vérifier les clés hardcodées
        const sourceFiles = this.findFilesByExtension(['.ts', '.tsx', '.js'], ['app', 'lib']);
        sourceFiles.forEach(file => {
            try {
                const content = fs.readFileSync(file, 'utf8');
                if (content.includes('sk_') || content.includes('pk_') || content.includes('rk_')) {
                    issues.push(`Clés API potentiellement hardcodées dans ${file}`);
                }
            } catch (error) {
                // Ignorer erreurs lecture
            }
        });

        return {
            issues,
            severity: issues.length > 0 ? 'HIGH' : 'LOW'
        };
    }

    analyzeDependencySecurity() {
        try {
            // Simuler audit de sécurité npm
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const dependencies = Object.keys(packageJson.dependencies || {});
            
            return {
                totalDependencies: dependencies.length,
                hasAuditScript: false,
                outdatedPackages: []
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    analyzeApiSecurity() {
        const apiFiles = this.findFilesByExtension(['.ts'], ['app/api']);
        const issues = [];
        
        apiFiles.forEach(file => {
            try {
                const content = fs.readFileSync(file, 'utf8');
                
                // Vérifier auth sur les routes API
                if (!content.includes('auth') && !content.includes('verify')) {
                    issues.push(`Route API sans protection: ${file}`);
                }
                
                // Vérifier validation input
                if (!content.includes('schema') && !content.includes('validate')) {
                    issues.push(`Route API sans validation: ${file}`);
                }
            } catch (error) {
                // Ignorer erreurs lecture
            }
        });

        return {
            apiRoutesCount: apiFiles.length,
            issues,
            severity: issues.length > 0 ? 'MEDIUM' : 'LOW'
        };
    }

    generateRecommendations() {
        console.log('\n💡 GÉNÉRATION RECOMMANDATIONS...');
        
        const recommendations = [];

        // Recommandations architecture
        if (this.auditResults.architecture.authSystems?.length > 2) {
            recommendations.push({
                category: 'ARCHITECTURE',
                priority: 'HIGH',
                issue: 'Multiples systèmes d\'authentification',
                solution: 'Consolider en un seul système (Supabase recommandé)',
                effort: 'MEDIUM'
            });
        }

        if (this.auditResults.architecture.duplicateVersions?.length > 0) {
            recommendations.push({
                category: 'CLEANUP',
                priority: 'MEDIUM', 
                issue: `${this.auditResults.architecture.duplicateVersions.length} versions dupliquées du projet`,
                solution: 'Supprimer les anciennes versions (guide-lyon-v1, v2, etc.)',
                effort: 'LOW'
            });
        }

        // Recommandations code
        const highIssues = this.auditResults.codeIssues.filter(i => i.severity === 'HIGH');
        if (highIssues.length > 0) {
            recommendations.push({
                category: 'CODE_QUALITY',
                priority: 'HIGH',
                issue: `${highIssues.length} problèmes critiques de code`,
                solution: 'Corriger les imports cassés et variables undefined',
                effort: 'MEDIUM'
            });
        }

        // Recommandations performance
        if (this.auditResults.performance?.imageOptimization?.unoptimizedCount > 5) {
            recommendations.push({
                category: 'PERFORMANCE',
                priority: 'MEDIUM',
                issue: 'Images non optimisées',
                solution: 'Compresser et convertir en WebP',
                effort: 'LOW'
            });
        }

        // Recommandations sécurité
        if (this.auditResults.security?.environment?.severity === 'HIGH') {
            recommendations.push({
                category: 'SECURITY',
                priority: 'CRITICAL',
                issue: 'Clés API exposées',
                solution: 'Déplacer toutes les clés vers variables d\'environnement',
                effort: 'HIGH'
            });
        }

        this.auditResults.recommendations = recommendations;
        console.log(`✅ ${recommendations.length} recommandations générées`);
    }

    generateAuditReport() {
        console.log('\n📋 GÉNÉRATION RAPPORT AUDIT...');
        
        try {
            // Finaliser le résumé
            this.auditResults.endTime = Date.now();
            this.auditResults.durationMs = this.auditResults.endTime - this.auditResults.startTime;
            
            this.auditResults.summary = {
                totalIssues: this.auditResults.codeIssues.length,
                criticalIssues: this.auditResults.recommendations.filter(r => r.priority === 'CRITICAL').length,
                highPriorityIssues: this.auditResults.recommendations.filter(r => r.priority === 'HIGH').length,
                authSystemsCount: this.auditResults.architecture.authSystems?.length || 0,
                duplicateVersions: this.auditResults.architecture.duplicateVersions?.length || 0,
                workflowStatus: Object.values(this.auditResults.workflows).filter(w => w.status === 'FUNCTIONAL').length,
                totalWorkflows: Object.keys(this.auditResults.workflows).length
            };

            // Générer rapport Markdown
            const reportContent = this.generateMarkdownReport();
            const reportPath = `audit-report-${this.timestamp}.md`;
            fs.writeFileSync(reportPath, reportContent);

            // Générer rapport JSON
            const reportJsonPath = `audit-report-${this.timestamp}.json`;
            fs.writeFileSync(reportJsonPath, JSON.stringify(this.auditResults, null, 2));

            console.log(`✅ Rapport généré: ${reportPath}`);
            
            return {
                markdownReport: reportPath,
                jsonReport: reportJsonPath,
                results: this.auditResults
            };

        } catch (error) {
            console.error(`❌ Erreur génération rapport: ${error.message}`);
            throw error;
        }
    }

    generateMarkdownReport() {
        const r = this.auditResults;
        const s = r.summary;

        return `# 🔍 AUDIT TECHNIQUE COMPLET
## Guide de Lyon - ${this.timestamp}

### 📊 RÉSUMÉ EXÉCUTIF
- **Problèmes identifiés**: ${s.totalIssues}
- **Problèmes critiques**: ${s.criticalIssues}
- **Problèmes haute priorité**: ${s.highPriorityIssues}
- **Systèmes d'auth**: ${s.authSystemsCount}
- **Versions dupliquées**: ${s.duplicateVersions}
- **Workflows fonctionnels**: ${s.workflowStatus}/${s.totalWorkflows}

### 🏗️ ARCHITECTURE
**Frameworks détectés:**
${r.architecture.frameworks?.map(f => `- ${f}`).join('\n') || 'Non analysé'}

**Systèmes d\'authentification:**
${r.architecture.authSystems?.map(auth => `- ${auth.file} (${auth.size} bytes)`).join('\n') || 'Aucun détecté'}

**Versions dupliquées:**
${r.architecture.duplicateVersions?.map(v => `- ${v.name} (${Math.round(v.size/1024/1024)}MB)`).join('\n') || 'Aucune'}

### 🐛 PROBLÈMES DE CODE
${r.codeIssues.length === 0 ? 'Aucun problème détecté' : 
  r.codeIssues.slice(0, 20).map(issue => 
    `- **${issue.type}** [${issue.severity}]: ${issue.issue} (${issue.file}${issue.line ? ':' + issue.line : ''})`
  ).join('\n')}

### 🔄 WORKFLOWS UTILISATEURS
${Object.entries(r.workflows).map(([name, workflow]) => 
  `**${name.toUpperCase()}**: ${workflow.status}\n${workflow.issues?.length > 0 ? workflow.issues.map(i => `  - ❌ ${i}`).join('\n') : '  - ✅ Fonctionnel'}`
).join('\n\n')}

### ⚡ PERFORMANCE
- **Images non optimisées**: ${r.performance?.imageOptimization?.unoptimizedCount || 0}
- **Lazy loading**: ${r.performance?.loadingStrategies?.hasLazyLoading ? 'Présent' : 'Absent'}
- **Configuration cache**: ${r.performance?.caching?.hasNextConfig ? 'Présente' : 'Manquante'}

### 🔒 SÉCURITÉ
- **Sévérité globale**: ${r.security?.environment?.severity || 'INCONNUE'}
- **Routes API non protégées**: ${r.security?.apiRoutes?.issues?.length || 0}
- **Problèmes d\'env**: ${r.security?.environment?.issues?.length || 0}

### 💡 RECOMMANDATIONS PRIORITAIRES
${r.recommendations.filter(rec => rec.priority === 'CRITICAL' || rec.priority === 'HIGH').map(rec => 
  `**${rec.category}** [${rec.priority}]
- **Problème**: ${rec.issue}
- **Solution**: ${rec.solution}
- **Effort**: ${rec.effort}`
).join('\n\n')}

### 📋 PLAN D'ACTION RECOMMANDÉ
1. **Phase 1 - Critique** (0-1 semaine)
   - Corriger les problèmes de sécurité critiques
   - Fixer les imports cassés bloquants
   - Consolider le système d'auth

2. **Phase 2 - Stabilisation** (1-2 semaines)
   - Nettoyer les versions dupliquées
   - Corriger les workflows cassés
   - Optimiser les performances

3. **Phase 3 - Amélioration** (2-4 semaines)
   - Refactoring code
   - Tests automatisés
   - Documentation

### 🔧 COMMANDES UTILES
\`\`\`bash
# Nettoyer versions dupliquées
rm -rf guide-lyon-v[1-9]*

# Audit sécurité dépendances
npm audit

# Build de production
npm run build

# Analyse bundle
npm run analyze
\`\`\`

---
*Rapport généré automatiquement le ${new Date().toLocaleString('fr-FR')}*
*Durée d'analyse: ${Math.round(r.durationMs / 1000)}s*
`;
    }

    async runFullAudit() {
        try {
            console.log('🚀 DÉMARRAGE AUDIT TECHNIQUE COMPLET...\n');
            
            this.analyzeProjectStructure();
            this.analyzeCodeIssues();
            this.analyzeWorkflows();
            this.analyzePerformance();
            this.analyzeSecurity();
            this.generateRecommendations();
            
            const report = this.generateAuditReport();
            
            console.log('\n🎉 AUDIT TERMINÉ AVEC SUCCÈS');
            console.log(`📋 Rapport: ${report.markdownReport}`);
            console.log(`📊 JSON: ${report.jsonReport}`);
            
            return report;

        } catch (error) {
            console.error('💥 ERREUR PENDANT AUDIT:', error);
            throw error;
        }
    }
}

// Exécution si appelé directement
if (require.main === module) {
    const auditor = new TechnicalAuditor();
    auditor.runFullAudit()
        .then(result => {
            console.log('\n✅ Audit terminé avec succès');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Audit échoué:', error.message);
            process.exit(1);
        });
}

module.exports = TechnicalAuditor;