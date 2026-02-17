<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('universities', function (Blueprint $table) {
            $table->boolean('sso_enabled')->default(false);
            $table->string('saml_entity_id')->nullable();
            $table->string('saml_sso_url', 2048)->nullable();
            $table->string('saml_slo_url', 2048)->nullable();
            $table->text('saml_certificate')->nullable();
            $table->string('saml_name_id_format')->default('urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress');
            $table->json('saml_attribute_map')->nullable();
            $table->boolean('sso_auto_approve')->default(true);
            $table->string('sso_default_role')->default('student');
        });
    }

    public function down(): void
    {
        Schema::table('universities', function (Blueprint $table) {
            $table->dropColumn([
                'sso_enabled',
                'saml_entity_id',
                'saml_sso_url',
                'saml_slo_url',
                'saml_certificate',
                'saml_name_id_format',
                'saml_attribute_map',
                'sso_auto_approve',
                'sso_default_role',
            ]);
        });
    }
};
