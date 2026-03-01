<?php

namespace App\Providers;

use App\Models\Appointment;
use App\Models\MentoringSession;
use App\Models\SessionNote;
use App\Models\SessionPhoto;
use App\Policies\AppointmentPolicy;
use App\Policies\MentoringSessionPolicy;
use App\Policies\SessionNotePolicy;
use App\Policies\SessionPhotoPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Appointment::class, AppointmentPolicy::class);
        Gate::policy(MentoringSession::class, MentoringSessionPolicy::class);
        Gate::policy(SessionNote::class, SessionNotePolicy::class);
        Gate::policy(SessionPhoto::class, SessionPhotoPolicy::class);
    }
}
