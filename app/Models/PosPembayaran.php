<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PosPembayaran extends Model
{
    use HasFactory;

    protected $table = 'pos_pembayaran';

    protected $fillable = ['nama_pos', 'tipe'];

    public function tagihan()
    {
        return $this->hasMany(Tagihan::class, 'id_pos');
    }
}
