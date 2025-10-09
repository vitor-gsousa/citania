#!/usr/bin/env node

/**
 * Script de verificação PWA para Citânia
 * Verifica se todos os requisitos PWA estão cumpridos
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuração PWA da Citânia...\n');

// 1. Verificar manifest.json
console.log('📱 Verificando manifest.json...');
try {
    const manifestPath = path.join(__dirname, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color', 'background_color', 'icons'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length === 0) {
        console.log('✅ Manifest.json válido com todos os campos obrigatórios');
        
        // Verificar ícones
        if (manifest.icons && manifest.icons.length >= 2) {
            console.log(`✅ ${manifest.icons.length} ícones definidos no manifest`);
            
            // Verificar se os ficheiros de ícones existem
            let iconsExist = true;
            manifest.icons.forEach(icon => {
                const iconPath = path.join(__dirname, icon.src);
                if (!fs.existsSync(iconPath)) {
                    console.log(`❌ Ícone não encontrado: ${icon.src}`);
                    iconsExist = false;
                } else {
                    console.log(`✅ Ícone encontrado: ${icon.src} (${icon.sizes})`);
                }
            });
            
            if (iconsExist) {
                console.log('✅ Todos os ícones estão presentes');
            }
        } else {
            console.log('⚠️ Poucos ícones definidos (recomendado: pelo menos 192x192 e 512x512)');
        }
    } else {
        console.log(`❌ Campos em falta no manifest: ${missingFields.join(', ')}`);
    }
} catch (error) {
    console.log(`❌ Erro ao verificar manifest.json: ${error.message}`);
}

console.log();

// 2. Verificar Service Worker
console.log('⚙️ Verificando Service Worker...');
try {
    const swPath = path.join(__dirname, 'sw.js');
    if (fs.existsSync(swPath)) {
        const swContent = fs.readFileSync(swPath, 'utf8');
        
        if (swContent.includes('addEventListener("install"') && 
            swContent.includes('addEventListener("fetch"')) {
            console.log('✅ Service Worker com eventos install e fetch');
        } else {
            console.log('⚠️ Service Worker pode estar incompleto');
        }
        
        if (swContent.includes('cache')) {
            console.log('✅ Service Worker implementa caching');
        }
    } else {
        console.log('❌ Service Worker (sw.js) não encontrado');
    }
} catch (error) {
    console.log(`❌ Erro ao verificar Service Worker: ${error.message}`);
}

console.log();

// 3. Verificar funcionalidade de instalação
console.log('📲 Verificando funcionalidade de instalação...');
try {
    const installPath = path.join(__dirname, 'js', 'features', 'pwa-install.js');
    if (fs.existsSync(installPath)) {
        const installContent = fs.readFileSync(installPath, 'utf8');
        
        if (installContent.includes('beforeinstallprompt')) {
            console.log('✅ Handler beforeinstallprompt implementado');
        }
        
        if (installContent.includes('appinstalled')) {
            console.log('✅ Handler appinstalled implementado');
        }
        
        if (installContent.includes('deferredPrompt')) {
            console.log('✅ Prompt de instalação pode ser diferido');
        }
    } else {
        console.log('❌ Módulo pwa-install.js não encontrado');
    }
} catch (error) {
    console.log(`❌ Erro ao verificar funcionalidade de instalação: ${error.message}`);
}

console.log();

// 4. Verificar integração no app principal
console.log('🔗 Verificando integração...');
try {
    const appPath = path.join(__dirname, 'js', 'app.js');
    if (fs.existsSync(appPath)) {
        const appContent = fs.readFileSync(appPath, 'utf8');
        
        if (appContent.includes('initPWAInstall')) {
            console.log('✅ Módulo PWA está integrado no app principal');
        } else {
            console.log('⚠️ Módulo PWA pode não estar integrado');
        }
        
        if (appContent.includes('serviceWorker')) {
            console.log('✅ Service Worker está registado');
        }
    }
} catch (error) {
    console.log(`❌ Erro ao verificar integração: ${error.message}`);
}

console.log();

// 5. Verificar estilos CSS
console.log('🎨 Verificando estilos PWA...');
try {
    const cssPath = path.join(__dirname, 'css', 'style.css');
    if (fs.existsSync(cssPath)) {
        const cssContent = fs.readFileSync(cssPath, 'utf8');
        
        if (cssContent.includes('#pwa-install-button')) {
            console.log('✅ Estilos do botão de instalação definidos');
        } else {
            console.log('⚠️ Estilos do botão de instalação podem estar em falta');
        }
        
        if (cssContent.includes('.install-success-notification')) {
            console.log('✅ Estilos de notificação de instalação definidos');
        }
    }
} catch (error) {
    console.log(`❌ Erro ao verificar estilos: ${error.message}`);
}

console.log();
console.log('🎯 Resumo:');
console.log('Para que a PWA funcione corretamente:');
console.log('1. ✅ Deve ter manifest.json válido');
console.log('2. ✅ Deve ter Service Worker funcional');
console.log('3. ✅ Deve ser servida via HTTPS (automático no Vercel)');
console.log('4. ✅ Deve ter handler beforeinstallprompt');
console.log('5. ✅ Deve ter ícones em diferentes tamanhos');
console.log();
console.log('💡 Para testar localmente:');
console.log('   npx http-server -p 8080 --ssl');
console.log('   Ou usar o Visual Studio Code Live Server');
console.log();
console.log('🚀 Para testar em produção:');
console.log('   Aceda a https://citania.vercel.app em Chrome/Edge móvel');
console.log('   O prompt de instalação deve aparecer automaticamente');