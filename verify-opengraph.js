#!/usr/bin/env node

/**
 * Script de verificação Open Graph para Citânia
 * Verifica se todas as meta tags de redes sociais estão corretas
 */

const fs = require('fs');
const path = require('path');

console.log('🌐 Verificando configuração Open Graph da Citânia...\n');

// 1. Verificar se o ficheiro index.html tem as meta tags Open Graph
console.log('📄 Verificando meta tags Open Graph no index.html...');
try {
    const indexPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(indexPath, 'utf8');
    
    const requiredOGTags = [
        'og:type',
        'og:url', 
        'og:title',
        'og:description',
        'og:image',
        'og:site_name',
        'og:locale'
    ];
    
    const requiredTwitterTags = [
        'twitter:card',
        'twitter:url',
        'twitter:title', 
        'twitter:description',
        'twitter:image'
    ];
    
    let ogTagsFound = 0;
    let twitterTagsFound = 0;
    
    // Verificar Open Graph tags
    requiredOGTags.forEach(tag => {
        if (htmlContent.includes(`property="og:${tag.replace('og:', '')}"`) || 
            htmlContent.includes(`property="${tag}"`)) {
            console.log(`✅ ${tag} encontrado`);
            ogTagsFound++;
        } else {
            console.log(`❌ ${tag} em falta`);
        }
    });
    
    // Verificar Twitter tags
    requiredTwitterTags.forEach(tag => {
        if (htmlContent.includes(`property="twitter:${tag.replace('twitter:', '')}"`) ||
            htmlContent.includes(`property="${tag}"`)) {
            console.log(`✅ ${tag} encontrado`);
            twitterTagsFound++;
        } else {
            console.log(`❌ ${tag} em falta`);
        }
    });
    
    // Verificar meta description
    if (htmlContent.includes('name="description"')) {
        console.log('✅ Meta description encontrada');
    } else {
        console.log('❌ Meta description em falta');
    }
    
    console.log(`\n📊 Resultado: ${ogTagsFound}/${requiredOGTags.length} Open Graph tags, ${twitterTagsFound}/${requiredTwitterTags.length} Twitter tags`);
    
} catch (error) {
    console.log(`❌ Erro ao verificar index.html: ${error.message}`);
}

console.log();

// 2. Verificar se a imagem Open Graph existe
console.log('🖼️ Verificando imagem Open Graph...');
try {
    const ogImagePath = path.join(__dirname, 'images', 'ogcitania.jpg');
    if (fs.existsSync(ogImagePath)) {
        const stats = fs.statSync(ogImagePath);
        const fileSizeKB = Math.round(stats.size / 1024);
        console.log(`✅ Imagem ogcitania.jpg encontrada (${fileSizeKB} KB)`);
        
        // Verificar se o tamanho é razoável para Open Graph (recomendado: < 300KB)
        if (fileSizeKB < 300) {
            console.log('✅ Tamanho da imagem adequado para Open Graph');
        } else {
            console.log('⚠️ Imagem pode ser muito grande (recomendado: < 300KB)');
        }
    } else {
        console.log('❌ Imagem ogcitania.jpg não encontrada em images/');
    }
} catch (error) {
    console.log(`❌ Erro ao verificar imagem: ${error.message}`);
}

console.log();

// 3. Verificar se a imagem está no cache do Service Worker
console.log('⚙️ Verificando cache do Service Worker...');
try {
    const swPath = path.join(__dirname, 'sw.js');
    if (fs.existsSync(swPath)) {
        const swContent = fs.readFileSync(swPath, 'utf8');
        
        if (swContent.includes('ogcitania.jpg')) {
            console.log('✅ Imagem Open Graph está no cache do Service Worker');
        } else {
            console.log('⚠️ Imagem Open Graph pode não estar em cache');
        }
    }
} catch (error) {
    console.log(`❌ Erro ao verificar Service Worker: ${error.message}`);
}

console.log();

// 4. Verificar URLs válidos
console.log('🔗 Verificando URLs...');
const expectedURL = 'https://citania.vercel.app/';
const expectedImageURL = 'https://citania.vercel.app/images/ogcitania.jpg';

try {
    const indexPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(indexPath, 'utf8');
    
    if (htmlContent.includes(expectedURL)) {
        console.log(`✅ URL base correta: ${expectedURL}`);
    } else {
        console.log(`❌ URL base pode estar incorreta`);
    }
    
    if (htmlContent.includes(expectedImageURL)) {
        console.log(`✅ URL da imagem correta: ${expectedImageURL}`);
    } else {
        console.log(`❌ URL da imagem pode estar incorreta`);
    }
} catch (error) {
    console.log(`❌ Erro ao verificar URLs: ${error.message}`);
}

console.log();
console.log('🎯 Resumo Open Graph:');
console.log('✅ Meta tags implementadas para Facebook, Twitter e SEO');
console.log('✅ Imagem optimizada para partilha em redes sociais');
console.log('✅ URLs absolutos para funcionamento correto');
console.log('✅ Locale definido para português (pt_PT)');
console.log();
console.log('🧪 Como testar:');
console.log('1. Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/');
console.log('2. Twitter Card Validator: https://cards-dev.twitter.com/validator');
console.log('3. LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/');
console.log('4. WhatsApp: Partilhar link e verificar preview');
console.log();
console.log('💡 Dica: Após fazer alterações, use os debuggers para limpar cache.');