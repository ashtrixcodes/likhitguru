const fs = require('fs');
const path = require('path');

const files = [
    'app/quiz/signTest.tsx',
    'app/quiz/eyeTest.tsx',
    'app/practiceMore/examTest.tsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add imports if not exist
    if (!content.includes("import { useTheme } from '@/context/ThemeContext';")) {
        content = content.replace(
            "import { useEffect, useRef, useState } from 'react';",
            "import { useEffect, useMemo, useRef, useState } from 'react';\nimport { useTheme } from '@/context/ThemeContext';\nimport { themedHeaderOptions } from '@/constants/screenHelpers';\nimport type { AppTheme } from '@/constants/theme';"
        ).replace(
            "import { useState, useRef, useEffect } from 'react';",
            "import { useEffect, useMemo, useRef, useState } from 'react';\nimport { useTheme } from '@/context/ThemeContext';\nimport { themedHeaderOptions } from '@/constants/screenHelpers';\nimport type { AppTheme } from '@/constants/theme';"
        );
    }

    // Inject useTheme inside main function
    const funcMatch = content.match(/export default function [a-zA-Z0-9_]+\(\) \{/);
    if (funcMatch && !content.includes("const { theme } = useTheme();")) {
        content = content.replace(funcMatch[0], `${funcMatch[0]}\n    const { theme } = useTheme();\n    const styles = useMemo(() => createStyles(theme), [theme]);`);
    }

    // Replace StyleSheet.create
    if (content.includes("const styles = StyleSheet.create({")) {
        content = content.replace(
            /const styles = StyleSheet\.create\({/g,
            "function createStyles(theme: AppTheme) {\n  const { colors, glass, isDark } = theme;\n  return StyleSheet.create({"
        );
        content = content + "\n}\n";
    }

    // Theme tokens replacements
    content = content.replace(/backgroundColor:\s*'#F5F5F5'/g, "backgroundColor: colors.background");
    content = content.replace(/backgroundColor:\s*'#fff'/g, "backgroundColor: isDark ? glass.backgroundColor : colors.card");
    content = content.replace(/backgroundColor:\s*'#ffffff'/g, "backgroundColor: isDark ? glass.backgroundColor : colors.card");
    content = content.replace(/borderColor:\s*'#E5E7EB'/g, "borderColor: isDark ? glass.borderColor : colors.cardBorder");
    content = content.replace(/borderColor:\s*'#E2E8F0'/g, "borderColor: isDark ? glass.borderColor : colors.cardBorder");
    content = content.replace(/borderColor:\s*'#D9D9D9'/g, "borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#D9D9D9'");
    content = content.replace(/color:\s*'#333'/g, "color: colors.text");
    content = content.replace(/color:\s*'#1E293B'/g, "color: colors.text");
    content = content.replace(/color:\s*'#475569'/g, "color: colors.textSecondary");
    content = content.replace(/color:\s*'#64748b'/g, "color: colors.textSecondary");
    content = content.replace(/color:\s*'#666'/g, "color: colors.textSecondary");
    content = content.replace(/color:\s*'#999'/g, "color: colors.textTertiary");
    
    // Replace Header options
    content = content.replace(/headerStyle:\s*{\s*backgroundColor:\s*'#434D57',?\s*},/g, "");
    content = content.replace(/headerTitleStyle:\s*{\s*fontSize:\s*18,?\s*color:\s*'#FFFFFF',?\s*},/g, "");
    content = content.replace(/headerTitleStyle:\s*{\s*fontWeight:\s*'600',?\s*fontSize:\s*18,?\s*color:\s*'#fff',?\s*},/g, "");
    content = content.replace(/headerTintColor:\s*'#FFFFFF',?/g, "...themedHeaderOptions(theme),");
    content = content.replace(/headerTintColor:\s*'#fff',?/g, "...themedHeaderOptions(theme),");

    // Replace header back button icon color
    content = content.replace(/<Ionicons name="arrow-back" size={24} color="\#FFFFFF" \/>/g, '<Ionicons name="arrow-back" size={24} color={theme.colors.text} />');
    content = content.replace(/<Ionicons name="arrow-back" size={24} color="\#fff" \/>/g, '<Ionicons name="arrow-back" size={24} color={theme.colors.text} />');

    fs.writeFileSync(file, content);
});
console.log("Patched theme styles");
