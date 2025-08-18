#!/bin/bash

echo "🎨 Moldova Direct - UI Review Script"
echo "====================================="
echo ""

# Check if screenshots exist
if [ -d "tests/e2e/ui-current.spec.ts-snapshots" ]; then
    echo "✅ UI Screenshots Available:"
    echo ""
    
    cd tests/e2e/ui-current.spec.ts-snapshots
    
    echo "📱 Mobile Views:"
    echo "  - homepage-mobile-current-chromium-es-darwin.png"
    echo ""
    
    echo "🌍 Multi-language Views:"
    echo "  - homepage-current-full-chromium-es-darwin.png (Spanish - Default)"
    echo "  - homepage-en-current-chromium-es-darwin.png (English)"
    echo "  - homepage-ro-current-chromium-es-darwin.png (Romanian)"
    echo ""
    
    echo "📄 Page Views:"
    echo "  - about-page-current-chromium-es-darwin.png"
    echo "  - products-page-current-chromium-es-darwin.png"
    echo "  - login-page-current-chromium-es-darwin.png"
    echo ""
    
    echo "🖥️ Desktop Views:"
    echo "  - homepage-current-viewport-chromium-es-darwin.png"
    echo ""
    
    echo "💡 To view these screenshots:"
    echo "   - Open them with Preview/Image viewer"
    echo "   - Or open VS Code in the screenshots folder"
    echo ""
    
    total_size=$(du -sh . | cut -f1)
    echo "📊 Total size: $total_size"
    echo ""
    
    cd - > /dev/null
else
    echo "❌ No screenshots found. Run UI tests first:"
    echo "   npm run test -- tests/e2e/ui-current.spec.ts --update-snapshots"
    echo ""
fi

echo "🚀 Available UI Testing Commands:"
echo "  npm run test -- tests/e2e/ui-current.spec.ts --update-snapshots  # Generate new baseline"
echo "  npm run test -- tests/e2e/ui-current.spec.ts                     # Validate against baseline"
echo "  npm run test:visual:update                                       # Update all visual tests"
echo "  npx playwright show-report                                       # View detailed test report"
echo ""