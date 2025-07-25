<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kelas extends Model
{
    protected $table = 'kelas';

    protected $fillable = ['nama_kelas', 'angkatan', 'tahun_ajaran'];

    public function siswa()
    {
        return $this->hasMany(Siswa::class, 'id_kelas');
    }
}
